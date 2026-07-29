import { Test, TestingModule } from '@nestjs/testing';
import { RepairsService } from './repairs.service';
import { PrismaService } from '../prisma/prisma.service';

const mockPrismaService = {
  car: { findUnique: jest.fn() },
  repair: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn(), aggregate: jest.fn() },
};

describe('RepairsService', () => {
  let service: RepairsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RepairsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RepairsService>(RepairsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
