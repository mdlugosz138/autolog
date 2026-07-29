import api from './axios';

export interface Refuel {
  id: string;
  date: string;
  liters: number;
  pricePerLiter: number;
  totalCost: number;
  mileage: number;
  fullTank: boolean;
}

export interface CreateRefuelInput {
  date: string;
  liters: number;
  pricePerLiter: number;
  mileage: number;
  fullTank?: boolean;
}

export interface ConsumptionDataPoint {
  date: string;
  mileage: number;
  distance: number;
  litersUsed: number;
  consumptionPer100km: number;
  costPerKm: number;
}

export interface ConsumptionStats {
  dataPoints: ConsumptionDataPoint[];
  averageConsumption: number | null;
  message?: string;
}

export async function getRefuels(carId: string): Promise<Refuel[]> {
  const res = await api.get(`/cars/${carId}/refuels`);
  return res.data;
}

export async function createRefuel(carId: string, data: CreateRefuelInput): Promise<Refuel> {
  const res = await api.post(`/cars/${carId}/refuels`, data);
  return res.data;
}

export async function updateRefuel(
  carId: string,
  refuelId: string,
  data: Partial<CreateRefuelInput>,
): Promise<Refuel> {
  const res = await api.patch(`/cars/${carId}/refuels/${refuelId}`, data);
  return res.data;
}

export async function deleteRefuel(carId: string, refuelId: string): Promise<void> {
  await api.delete(`/cars/${carId}/refuels/${refuelId}`);
}

export async function getConsumptionStats(carId: string): Promise<ConsumptionStats> {
  const res = await api.get(`/cars/${carId}/refuels/stats`);
  return res.data;
}
