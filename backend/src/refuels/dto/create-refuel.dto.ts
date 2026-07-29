import { IsNumber, IsDateString, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateRefuelDto {
  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0.1)
  liters!: number;

  @IsNumber()
  @Min(0.01)
  pricePerLiter!: number;

  @IsNumber()
  @Min(0)
  mileage!: number;

  @IsOptional()
  @IsBoolean()
  fullTank?: boolean;
}