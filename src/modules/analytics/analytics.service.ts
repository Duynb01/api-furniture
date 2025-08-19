import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

type CategoryStats = {
  categoryId: number;
  categoryName: string;
  totalQuantity: number;
  totalRevenue: number;
  revenuePercent: number;
};

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}
  async getCategoryPerformance() {
    // Lấy tất cả category trước
    const categories = await this.prisma.category.findMany();
    // Lấy tất cả orderItem hợp lệ (DELIVERED hoặc VNPAY)
    const orderItems = await this.prisma.orderItem.findMany({
      include: {
        product: { include: { category: true } },
        order: { include: { Payment: true } },
      },
      where: {
        OR: [
          { order: { status: 'DELIVERED' } },
          { order: { Payment: { method: 'vnpay' } } },
        ],
      },
    });
    // Gộp doanh thu theo category
    const categoryMap: Record<string, CategoryStats> = {};
    let totalRevenueAll = 0;

    orderItems.forEach(item => {
      const cat = item.product.category;
      if (!cat) return;

      const revenue = item.quantity * item.price;
      totalRevenueAll += revenue;

      if (!categoryMap[cat.id]) {
        categoryMap[cat.id] = {
          categoryId: cat.id,
          categoryName: cat.name,
          totalQuantity: 0,
          totalRevenue: 0,
          revenuePercent: 0,
        };
      }

      categoryMap[cat.id].totalQuantity += item.quantity;
      categoryMap[cat.id].totalRevenue += revenue;
    });

    // Ghép tất cả category, nếu category nào không có doanh thu thì mặc định 0
    const result: CategoryStats[] = categories.map(cat => {
      const stats = categoryMap[cat.id];
      const totalRevenue = stats?.totalRevenue || 0;
      const totalQuantity = stats?.totalQuantity || 0;
      return {
        categoryId: cat.id,
        categoryName: cat.name,
        totalQuantity,
        totalRevenue,
        revenuePercent: totalRevenueAll ? +(totalRevenue / totalRevenueAll * 100).toFixed(2) : 0,
      };
    });

    // Sắp xếp theo doanh thu giảm dần
    return result.sort((a, b) => b.totalRevenue - a.totalRevenue);
  }

  async getMonthlyRevenue() {
    const today = new Date();
    const months: { month: string; start: Date; end: Date }[] = [];

    for (let i = 4; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthStr = d.toLocaleString("default", { month: "short" });
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
      months.push({ month: monthStr, start, end });
    }

    return Promise.all(
      months.map(async ({ month, start, end }) => {
        const orders = await this.prisma.order.findMany({
          where: {
            createdAt: { gte: start, lte: end },
            OR: [
              { status: "DELIVERED" },
              { Payment: { method: "vnpay" } },
            ],
          },
          include: { Payment: true, items: true },
        });
        const revenue = orders.reduce((sum, order) => {
          const orderRevenue = order.items.reduce(
            (s, item) => s + item.price * item.quantity,
            0
          );
          return sum + orderRevenue;
        }, 0);

        return { month, revenue };
      })
    );

  }

}
