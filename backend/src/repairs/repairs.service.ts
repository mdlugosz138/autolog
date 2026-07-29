import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRepairDto } from './dto/create-repair.dto';

@Injectable()
export class RepairsService {
  constructor(private prisma: PrismaService) {}

  private async verifyCarOwnership(userId: string, carId: string) {
    const car = await this.prisma.car.findUnique({ where: { id: carId } });
    if (!car) throw new NotFoundException('Samochód nie istnieje');
    if (car.userId !== userId) throw new ForbiddenException('Brak dostępu');
    return car;
  }

  async create(userId: string, carId: string, dto: CreateRepairDto) {
    await this.verifyCarOwnership(userId, carId);
    return this.prisma.repair.create({
      data: {
        carId,
        type: dto.type,
        date: new Date(dto.date),
        mileage: dto.mileage,
        cost: dto.cost,
        notes: dto.notes,
      },
    });
  }

  async findAllForCar(userId: string, carId: string) {
    await this.verifyCarOwnership(userId, carId);
    return this.prisma.repair.findMany({
      where: { carId },
      orderBy: { date: 'desc' },
    });
  }

  async remove(userId: string, carId: string, repairId: string) {
    await this.verifyCarOwnership(userId, carId);
    const repair = await this.prisma.repair.findUnique({ where: { id: repairId } });
    if (!repair || repair.carId !== carId) throw new NotFoundException('Naprawa nie istnieje');
    return this.prisma.repair.delete({ where: { id: repairId } });
  }

  async update(userId: string, carId: string, repairId: string, dto: Partial<CreateRepairDto>) {
  await this.verifyCarOwnership(userId, carId);
  const repair = await this.prisma.repair.findUnique({ where: { id: repairId } });
  if (!repair || repair.carId !== carId) throw new NotFoundException('Naprawa nie istnieje');

  return this.prisma.repair.update({
    where: { id: repairId },
    data: {
      type: dto.type,
      date: dto.date ? new Date(dto.date) : undefined,
      mileage: dto.mileage,
      cost: dto.cost,
      notes: dto.notes,
    },
  });
}

  async getTotalCost(userId: string, carId: string) {
    await this.verifyCarOwnership(userId, carId);
    const result = await this.prisma.repair.aggregate({
      where: { carId },
      _sum: { cost: true },
      _count: true,
    });
    return {
      totalCost: result._sum.cost ?? 0,
      repairsCount: result._count,
    };
  }
}