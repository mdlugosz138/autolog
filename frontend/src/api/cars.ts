import api from './axios';

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  vin?: string;
  engineType?: string;
  currentMileage: number;
  createdAt: string;
}

export interface CreateCarInput {
  make: string;
  model: string;
  year: number;
  currentMileage: number;
  vin?: string;
  engineType?: string;
}

export async function getCars(): Promise<Car[]> {
  const res = await api.get('/cars');
  return res.data;
}

export async function createCar(data: CreateCarInput): Promise<Car> {
  const res = await api.post('/cars', data);
  return res.data;
}

export async function deleteCar(id: string): Promise<void> {
  await api.delete(`/cars/${id}`);
}

export async function getCar(id: string): Promise<Car> {
  const res = await api.get(`/cars/${id}`);
  return res.data;
}

export interface DecodedVin {
  make: string;
  model: string;
  year: number | null;
  engineType: string | null;
}

export async function decodeVin(vin: string): Promise<DecodedVin> {
  const res = await api.get(`/cars/decode-vin/${vin}`);
  return res.data;
}