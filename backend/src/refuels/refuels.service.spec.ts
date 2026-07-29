import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { RefuelsService } from './refuels.service';
import { PrismaService } from '../prisma/prisma.service';

// Fałszywy (mockowany) PrismaService — udajemy bazę danych, żeby test
// nie zależał od prawdziwego Postgresa i był szybki oraz przewidywalny.
const mockPrismaService = {
  car: {
    findUnique: jest.fn(),
  },
  refuel: {
    findMany: jest.fn(),
  },
};

describe('RefuelsService', () => {
  let service: RefuelsService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RefuelsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RefuelsService>(RefuelsService);
  });

  it('powinien być zdefiniowany', () => {
    expect(service).toBeDefined();
  });

  describe('getConsumptionStats', () => {
    const userId = 'user-1';
    const carId = 'car-1';

    it('rzuca NotFoundException, jeśli samochód nie istnieje', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue(null);

      await expect(service.getConsumptionStats(userId, carId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('rzuca ForbiddenException, jeśli samochód należy do innego użytkownika', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({ id: carId, userId: 'inny-user' });

      await expect(service.getConsumptionStats(userId, carId)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('zwraca komunikat, jeśli jest mniej niż 2 pełne tankowania', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({ id: carId, userId });
      mockPrismaService.refuel.findMany.mockResolvedValue([
        { mileage: 1000, liters: 40, totalCost: 200, fullTank: true, date: new Date() },
      ]);

      const result = await service.getConsumptionStats(userId, carId);

      expect(result.averageConsumption).toBeNull();
      expect(result.dataPoints).toEqual([]);
      expect(result.message).toBeDefined();
    });

    it('poprawnie liczy spalanie dla dwóch pełnych tankowań', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({ id: carId, userId });
      mockPrismaService.refuel.findMany.mockResolvedValue([
        { mileage: 85000, liters: 40, totalCost: 260, fullTank: true, date: new Date('2026-06-01') },
        { mileage: 85600, liters: 38, totalCost: 250.8, fullTank: true, date: new Date('2026-06-15') },
      ]);

      const result = await service.getConsumptionStats(userId, carId);

      // dystans 600 km, 38 litrów -> (38 / 600) * 100 = 6.33 l/100km
      expect(result.dataPoints).toHaveLength(1);
      expect(result.dataPoints[0].consumptionPer100km).toBeCloseTo(6.33, 2);
      expect(result.dataPoints[0].distance).toBe(600);
      expect(result.averageConsumption).toBeCloseTo(6.33, 2);
    });

    it('pomija tankowania z ujemnym lub zerowym dystansem (błędne/duplikowane dane)', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({ id: carId, userId });
      mockPrismaService.refuel.findMany.mockResolvedValue([
        { mileage: 85000, liters: 40, totalCost: 260, fullTank: true, date: new Date('2026-06-01') },
        // ten sam przebieg co poprzedni -> dystans 0, powinien zostać pominięty
        { mileage: 85000, liters: 35, totalCost: 227.5, fullTank: true, date: new Date('2026-06-05') },
        { mileage: 85600, liters: 38, totalCost: 250.8, fullTank: true, date: new Date('2026-06-15') },
      ]);

      const result = await service.getConsumptionStats(userId, carId);

      // Powinien policzyć tylko jedną parę (pierwsza -> trzecia), bo środkowa ma dystans 0
      expect(result.dataPoints).toHaveLength(1);
      expect(result.dataPoints[0].distance).toBe(600);
    });

    it('liczy średnią z wielu par tankowań', async () => {
      mockPrismaService.car.findUnique.mockResolvedValue({ id: carId, userId });
      mockPrismaService.refuel.findMany.mockResolvedValue([
        { mileage: 0, liters: 40, totalCost: 260, fullTank: true, date: new Date('2026-01-01') },
        { mileage: 500, liters: 30, totalCost: 195, fullTank: true, date: new Date('2026-01-10') }, // 6.0 l/100km
        { mileage: 1000, liters: 35, totalCost: 227.5, fullTank: true, date: new Date('2026-01-20') }, // 7.0 l/100km
      ]);

      const result = await service.getConsumptionStats(userId, carId);

      expect(result.dataPoints).toHaveLength(2);
      expect(result.averageConsumption).toBeCloseTo(6.5, 2); // średnia z 6.0 i 7.0
    });

    it('ignoruje tankowania oznaczone jako niepełny bak', async () => {
      // Zwracamy tylko te, które przeszłyby filtr `where: { fullTank: true }` w prawdziwym zapytaniu —
      // symulujemy, że Prisma już odfiltrowała niepełne tankowania po stronie bazy.
      mockPrismaService.car.findUnique.mockResolvedValue({ id: carId, userId });
      mockPrismaService.refuel.findMany.mockResolvedValue([
        { mileage: 1000, liters: 40, totalCost: 260, fullTank: true, date: new Date('2026-01-01') },
        { mileage: 1500, liters: 30, totalCost: 195, fullTank: true, date: new Date('2026-01-10') },
      ]);

      const result = await service.getConsumptionStats(userId, carId);

      expect(mockPrismaService.refuel.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ fullTank: true }),
        }),
      );
      expect(result.dataPoints).toHaveLength(1);
    });
  });
});
