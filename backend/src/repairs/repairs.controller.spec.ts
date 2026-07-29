import { Test, TestingModule } from '@nestjs/testing';
import { RepairsController } from './repairs.controller';
import { RepairsService } from './repairs.service';

const mockRepairsService = {
  create: jest.fn(),
  findAllForCar: jest.fn(),
  getTotalCost: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RepairsController', () => {
  let controller: RepairsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RepairsController],
      providers: [{ provide: RepairsService, useValue: mockRepairsService }],
    }).compile();

    controller = module.get<RepairsController>(RepairsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
