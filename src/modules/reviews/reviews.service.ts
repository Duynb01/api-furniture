import { Injectable } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}
  async create(userId: string ,createReviewDto: CreateReviewDto) {
    const review = await this.prisma.review.create({
      data: {
        content: createReviewDto.content,
        rating: createReviewDto.rating,
        productId: createReviewDto.productId,
        userId: userId,
      },
      include: {
        user: {
          select: { name: true }
        }
      }
    })
    return {
      user: review.user.name,
      content: review.content,
      rating: review.rating,
      createdAt: review.createdAt,
    }
  }

  async findAll(productId: string) {
    const reviews = await  this.prisma.review.findMany({
      where: {productId},
      select:{
        id: true,
        content: true,
        rating: true,
        user: {
          select: {name: true}
        },
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return reviews.map((review)=>{
      return {
        id: review.id,
        content: review.content,
        rating: review.rating,
        user: review.user.name,
        createdAt: review.createdAt
      }
    })
  }
}
