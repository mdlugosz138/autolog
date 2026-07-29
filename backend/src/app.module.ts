import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CarsModule } from './cars/cars.module';
import { RefuelsModule } from './refuels/refuels.module';
import { RepairsModule } from './repairs/repairs.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, CarsModule, RefuelsModule, RepairsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}