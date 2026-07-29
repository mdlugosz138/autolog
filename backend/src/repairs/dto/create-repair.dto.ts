import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateRepairDto {
  @IsString()
  type!: string;

  @IsDateString()
  date!: string;

  @IsNumber()
  @Min(0)
  mileage!: number;

  @IsNumber()
  @Min(0)
  cost!: number;

  @IsOptional()
  @IsString()
  notes?: string;
}