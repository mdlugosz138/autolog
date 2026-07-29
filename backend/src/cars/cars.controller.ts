import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CarsService } from './cars.service';
import { CreateCarDto } from './dto/create-car.dto';

@UseGuards(JwtAuthGuard)
@Controller('cars')
export class CarsController {
  constructor(private carsService: CarsService) {}

  @Post()
  create(@Req() req: any, @Body() dto: CreateCarDto) {
    return this.carsService.create(req.user.userId, dto);
  }

  @Get()
  findAll(@Req() req: any) {
    return this.carsService.findAllForUser(req.user.userId);
  }

  @Get('decode-vin/:vin')
  decodeVin(@Param('vin') vin: string) {
    return this.carsService.decodeVin(vin);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    return this.carsService.findOne(req.user.userId, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() dto: Partial<CreateCarDto>) {
    return this.carsService.update(req.user.userId, id, dto);
  }

  @Delete(':id')
  remove(@Req() req: any, @Param('id') id: string) {
    return this.carsService.remove(req.user.userId, id);
  }
  
  
}