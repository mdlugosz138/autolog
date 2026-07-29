import api from './axios';

export interface Repair {
  id: string;
  type: string;
  date: string;
  mileage: number;
  cost: number;
  notes?: string;
}

export interface CreateRepairInput {
  type: string;
  date: string;
  mileage: number;
  cost: number;
  notes?: string;
}

export interface RepairsTotal {
  totalCost: number;
  repairsCount: number;
}

export async function getRepairs(carId: string): Promise<Repair[]> {
  const res = await api.get(`/cars/${carId}/repairs`);
  return res.data;
}

export async function createRepair(carId: string, data: CreateRepairInput): Promise<Repair> {
  const res = await api.post(`/cars/${carId}/repairs`, data);
  return res.data;
}

export async function deleteRepair(carId: string, repairId: string): Promise<void> {
  await api.delete(`/cars/${carId}/repairs/${repairId}`);
}

export async function getRepairsTotal(carId: string): Promise<RepairsTotal> {
  const res = await api.get(`/cars/${carId}/repairs/total`);
  return res.data;
}

export async function updateRepair(
  carId: string,
  repairId: string,
  data: Partial<CreateRepairInput>,
): Promise<Repair> {
  const res = await api.patch(`/cars/${carId}/repairs/${repairId}`, data);
  return res.data;
}