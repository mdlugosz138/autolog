import { Module } from '@nestjs/common';
import { RefuelsController } from './refuels.controller';
import { RefuelsService } from './refuels.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RefuelsController],
  providers: [RefuelsService],
})
export class RefuelsModule {}