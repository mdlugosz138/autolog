import { Injectable, NotFoundException, ForbiddenException, BadRequestException, ServiceUnavailableException  } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCarDto } from './dto/create-car.dto';


@Injectable()
export class CarsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateCarDto) {
    return this.prisma.car.create({
      data: { ...dto, userId },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.car.findMany({ where: { userId } });
  }

  async findOne(userId: string, carId: string) {
    const car = await this.prisma.car.findUnique({ where: { id: carId } });
    if (!car) throw new NotFoundException('Samochód nie istnieje');
    if (car.userId !== userId) throw new ForbiddenException('Brak dostępu');
    return car;
  }

  async update(userId: string, carId: string, dto: Partial<CreateCarDto>) {
    await this.findOne(userId, carId); // sprawdza istnienie i własność
    return this.prisma.car.update({ where: { id: carId }, data: dto });
  }

  async remove(userId: string, carId: string) {
    await this.findOne(userId, carId);
    return this.prisma.car.delete({ where: { id: carId } });
  }

  async decodeVin(vin: string) {
  if (!vin || vin.length !== 17) {
    throw new BadRequestException('VIN musi mieć dokładnie 17 znaków');
  }

  const url = `https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${vin}?format=json`;

  let response: Response;
  try {
    response = await fetch(url);
  } catch {
    throw new ServiceUnavailableException('Nie udało się połączyć z bazą NHTSA');
  }

  if (!response.ok) {
    throw new ServiceUnavailableException('NHTSA API zwróciło błąd');
  }

  const data = await response.json();
  const results: { Variable: string; Value: string | null }[] = data.Results;

  const getValue = (variableName: string) =>
    results.find((r) => r.Variable === variableName)?.Value || null;

  const make = getValue('Make');
  const model = getValue('Model');
  const year = getValue('Model Year');

  if (!make || !model) {
    throw new NotFoundException('Nie udało się rozpoznać samochodu dla podanego VIN');
  }

  return {
    make,
    model,
    year: year ? Number(year) : null,
    engineType: getValue('Engine Configuration') || getValue('Engine Model') || null,
  };
}
}