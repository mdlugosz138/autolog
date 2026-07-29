import { Test, TestingModule } from '@nestjs/testing';
import { RefuelsController } from './refuels.controller';
import { RefuelsService } from './refuels.service';

const mockRefuelsService = {
  create: jest.fn(),
  findAllForCar: jest.fn(),
  getConsumptionStats: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('RefuelsController', () => {
  let controller: RefuelsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefuelsController],
      providers: [{ provide: RefuelsService, useValue: mockRefuelsService }],
    }).compile();

    controller = module.get<RefuelsController>(RefuelsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
