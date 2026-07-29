import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RefuelsService } from './refuels.service';
import { CreateRefuelDto } from './dto/create-refuel.dto';

@UseGuards(JwtAuthGuard)
@Controller('cars/:carId/refuels')
export class RefuelsController {
  constructor(private refuelsService: RefuelsService) {}

  @Post()
  create(@Req() req: any, @Param('carId') carId: string, @Body() dto: CreateRefuelDto) {
    return this.refuelsService.create(req.user.userId, carId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Param('carId') carId: string) {
    return this.refuelsService.findAllForCar(req.user.userId, carId);
  }

  @Get('stats')
  getStats(@Req() req: any, @Param('carId') carId: string) {
    return this.refuelsService.getConsumptionStats(req.user.userId, carId);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('carId') carId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateRefuelDto>,
  ) {
    return this.refuelsService.update(req.user.userId, carId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('carId') carId: string, @Param('id') id: string) {
    return this.refuelsService.remove(req.user.userId, carId, id);
  }
}
