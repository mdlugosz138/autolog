import { IsString, IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateCarDto {
  @IsString()
  make!: string;

  @IsString()
  model!: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  year!: number;

  @IsOptional()
  @IsString()
  vin?: string;

  @IsOptional()
  @IsString()
  engineType?: string;

  @IsInt()
  @Min(0)
  currentMileage!: number;
}