import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRefuelDto } from './dto/create-refuel.dto';

@Injectable()
export class RefuelsService {
  constructor(private prisma: PrismaService) {}

  private async verifyCarOwnership(userId: string, carId: string) {
    const car = await this.prisma.car.findUnique({ where: { id: carId } });
    if (!car) throw new NotFoundException('Samochód nie istnieje');
    if (car.userId !== userId) throw new ForbiddenException('Brak dostępu');
    return car;
  }

  async create(userId: string, carId: string, dto: CreateRefuelDto) {
    await this.verifyCarOwnership(userId, carId);

    const totalCost = Number((dto.liters * dto.pricePerLiter).toFixed(2));

    const refuel = await this.prisma.refuel.create({
      data: {
        carId,
        date: new Date(dto.date),
        liters: dto.liters,
        pricePerLiter: dto.pricePerLiter,
        totalCost,
        mileage: dto.mileage,
        fullTank: dto.fullTank ?? true,
      },
    });

    // aktualizujemy przebieg auta, jeśli tankowanie ma wyższy przebieg niż zapisany
    await this.prisma.car.updateMany({
      where: { id: carId, currentMileage: { lt: dto.mileage } },
      data: { currentMileage: dto.mileage },
    });

    return refuel;
  }

  async findAllForCar(userId: string, carId: string) {
    await this.verifyCarOwnership(userId, carId);
    return this.prisma.refuel.findMany({
      where: { carId },
      orderBy: { mileage: 'asc' },
    });
  }

  async update(userId: string, carId: string, refuelId: string, dto: Partial<CreateRefuelDto>) {
    await this.verifyCarOwnership(userId, carId);
    const refuel = await this.prisma.refuel.findUnique({ where: { id: refuelId } });
    if (!refuel || refuel.carId !== carId) throw new NotFoundException('Tankowanie nie istnieje');

    const liters = dto.liters ?? refuel.liters;
    const pricePerLiter = dto.pricePerLiter ?? refuel.pricePerLiter;
    const totalCost = Number((liters * pricePerLiter).toFixed(2));

    return this.prisma.refuel.update({
      where: { id: refuelId },
      data: {
        date: dto.date ? new Date(dto.date) : undefined,
        liters: dto.liters,
        pricePerLiter: dto.pricePerLiter,
        totalCost,
        mileage: dto.mileage,
        fullTank: dto.fullTank,
      },
    });
  }

  async remove(userId: string, carId: string, refuelId: string) {
    await this.verifyCarOwnership(userId, carId);
    const refuel = await this.prisma.refuel.findUnique({ where: { id: refuelId } });
    if (!refuel || refuel.carId !== carId) throw new NotFoundException('Tankowanie nie istnieje');
    return this.prisma.refuel.delete({ where: { id: refuelId } });
  }

  /**
   * Liczy realne spalanie na podstawie kolejnych PEŁNYCH tankowań.
   * Logika: spalanie między tankowaniem A i B = suma litrów zatankowanych
   * MIĘDZY nimi (czyli przy B, bo A było "zerowaniem" baku) / dystans (B.mileage - A.mileage) * 100
   *
   * Upraszczając na start: liczymy tylko dla par kolejnych "fullTank" tankowań.
   */
  async getConsumptionStats(userId: string, carId: string) {
    await this.verifyCarOwnership(userId, carId);

    const refuels = await this.prisma.refuel.findMany({
      where: { carId, fullTank: true },
      orderBy: { mileage: 'asc' },
    });

    if (refuels.length < 2) {
      return {
        message: 'Potrzeba przynajmniej 2 pełnych tankowań, żeby policzyć spalanie',
        dataPoints: [],
        averageConsumption: null,
      };
    }

    const dataPoints: {
      date: Date;
      mileage: number;
      distance: number;
      litersUsed: number;
      consumptionPer100km: number;
      costPerKm: number;
    }[] = [];

    for (let i = 1; i < refuels.length; i++) {
      const prev = refuels[i - 1];
      const curr = refuels[i];
      const distance = curr.mileage - prev.mileage;

      if (distance <= 0) continue; // ochrona przed błędnymi/duplikowanymi danymi

      const consumption = (curr.liters / distance) * 100;
      dataPoints.push({
        date: curr.date,
        mileage: curr.mileage,
        distance,
        litersUsed: curr.liters,
        consumptionPer100km: Number(consumption.toFixed(2)),
        costPerKm: Number((curr.totalCost / distance).toFixed(2)),
      });
    }

    const averageConsumption =
      dataPoints.length > 0
        ? Number((dataPoints.reduce((sum, p) => sum + p.consumptionPer100km, 0) / dataPoints.length).toFixed(2))
        : null;

    return { dataPoints, averageConsumption };
  }
}
