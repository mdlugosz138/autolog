import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RepairsService } from './repairs.service';
import { CreateRepairDto } from './dto/create-repair.dto';

@UseGuards(JwtAuthGuard)
@Controller('cars/:carId/repairs')
export class RepairsController {
  constructor(private repairsService: RepairsService) {}

  @Post()
  create(@Req() req: any, @Param('carId') carId: string, @Body() dto: CreateRepairDto) {
    return this.repairsService.create(req.user.userId, carId, dto);
  }

  @Get()
  findAll(@Req() req: any, @Param('carId') carId: string) {
    return this.repairsService.findAllForCar(req.user.userId, carId);
  }

  @Get('total')
  getTotal(@Req() req: any, @Param('carId') carId: string) {
    return this.repairsService.getTotalCost(req.user.userId, carId);
  }

  @Patch(':id')
  update(
    @Req() req: any,
    @Param('carId') carId: string,
    @Param('id') id: string,
    @Body() dto: Partial<CreateRepairDto>,
  ) {
    return this.repairsService.update(req.user.userId, carId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('carId') carId: string, @Param('id') id: string) {
    return this.repairsService.remove(req.user.userId, carId, id);
  }
}
