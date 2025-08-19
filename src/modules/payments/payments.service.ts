import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PrismaService } from '../../prisma/prisma.service';
import { generatePaymentCode } from '../../utils/generate-code';
import { createVnpayUrl } from '../../utils/vnpay.util';
import * as dayjs from 'dayjs';
import * as qs from 'qs';
import * as crypto from 'crypto';
import { OrdersService } from '../orders/orders.service';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService,
              private  readonly orderService: OrdersService) {}

  async create(createPaymentDto: CreatePaymentDto) {
    const order = await this.prisma.order.findUnique({
      where:{
        id: createPaymentDto.orderId
      }
    })
    if(!order) throw new NotFoundException('Không tìm thấy đơn hàng')

      const code = generatePaymentCode();
      return this.prisma.payment.create({
        data: {
          code,
          orderId: createPaymentDto.orderId,
          method: createPaymentDto.method,
          amount: createPaymentDto.amount,
          status: 'PENDING',
          transactionId: null,
          paymentTime:  new Date()
        }
      })
  }

  async getAll(status?: string){
    return this.prisma.payment.findMany({
      where: status ? {status} : {},
      orderBy: {createdAt: 'desc'},
      include: {order: true}
    })
  }

  async updateStatus(orderId: string, status: string, transactionId?: string){
    const payment = await this.prisma.payment.findUnique({
      where: {orderId}
    })
    if (!payment) throw new NotFoundException('Không tìm thấy thanh toán');
    return this.prisma.payment.update({
      where: {orderId},
      data: {
        status,
        transactionId,
        paymentTime: new Date()
      }
    })
  }

  async createVnpayPayment(dto: CreatePaymentDto) {

    const tmnCode = process.env.VNP_TMNCODE as string;
    const secretKey = process.env.VNP_HASHSECRET as string;
    const vnpUrl = process.env.VNP_URL as string;
    const returnUrl = process.env.VNP_RETURN_URL as string;
    const createDate = dayjs().format('YYYYMMDDHHmmss');
    const code= generatePaymentCode();

    const vnpParams: Record<string, string | number> = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: tmnCode,
      vnp_Locale: 'vn',
      vnp_CurrCode: 'VND',
      vnp_TxnRef: dto.orderId,
      vnp_OrderInfo: dto.orderId,
      vnp_OrderType: 'other',
      vnp_Amount: dto.amount * 100, // VNPay yêu cầu nhân 100
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: '127.0.0.1',
      vnp_CreateDate: createDate,
    };
    const url = createVnpayUrl(vnpParams, secretKey, vnpUrl);

    // Tạo bản ghi Payment
    const payment = await this.prisma.payment.create({
      data: {
        code: code,
        method: 'vnpay',
        status: 'PENDING',
        amount: dto.amount,
        orderId: dto.orderId,
      },
    });

    return { url, payment };
  }

  async handleVnpayReturn(query: any) {
    const secureHash = query['vnp_SecureHash'];
    delete query['vnp_SecureHash'];
    delete query['vnp_SecureHashType'];

    const secretKey = process.env.VNP_HASHSECRET as string;
    const sorted = Object.keys(query)
      .sort()
      .reduce((obj, key) => {
        obj[key] = query[key];
        return obj;
      }, {} as Record<string, any>);

    const signData = qs.stringify(sorted, { encode: false });
    const checkSum = crypto.createHmac('sha512', secretKey).update(signData).digest('hex');

    if (secureHash === checkSum) {
      const rspCode = query['vnp_ResponseCode'];
      const txnRef = query['vnp_TxnRef'];
      const transactionId = query['vnp_TransactionNo'];

      const status = rspCode === '00' ? 'SUCCESS' : 'FAILED';

      try {
        const payment = await this.prisma.$transaction(async (prisma) => {
          const updatedPayment = await prisma.payment.update({
            where: { orderId: txnRef },
            data: {
              status,
              transactionId,
              paymentTime: new Date(),
            },
          });

          // Nếu thanh toán thất bại và payment chưa SUCCESS, hủy đơn hàng
          if (rspCode !== '00' && updatedPayment.status !== 'SUCCESS') {
            const order = await prisma.order.findUnique({ where: { id: txnRef } });
            if (!order) throw new NotFoundException(`Không tìm thấy đơn hàng`);

            await this.orderService.cancelOrderByUser(txnRef, order.userId);
          }
          return updatedPayment;
        });

        return { message: 'Thanh toán thành công', payment };
      } catch (err){
        console.error(err);
        throw new BadRequestException('Thanh toán thất bại')
      }
    } else {
      throw new BadRequestException('Invalid checksum');
    }
  }
}
