import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../../common/roles.decorator';
import { RolesGuard } from '../../common/roles.guard';
import { AnalyticsService } from './analytics.service';


@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('category-performance')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getCategoryPerformance() {
    return this.analyticsService.getCategoryPerformance();
  }

  @Get('monthly-revenue')
  @Roles('ADMIN')
  @UseGuards(RolesGuard)
  async getMonthlyRevenue() {
    return this.analyticsService.getMonthlyRevenue();
  }
}
