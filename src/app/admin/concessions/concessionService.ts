import concessionApi from '@/api/concessionApi';
import { Concession } from '@/types/Concession';

export const getAllConcessions = async (): Promise<Concession[]> => {
  const response = await concessionApi.getAll();
  const data = response.data.data || response.data;
  return data.map((item: any) => ({
    ...item,
    id: item.id ?? item.concessionId,
    category: item.category
  }));
};

export const addConcession = async (data: Omit<Concession, 'id'>) => {
  return concessionApi.add(data);
};

export const updateConcession = async (id: number, data: Partial<Concession>) => {
  return concessionApi.update(id, data);
};

export const deleteConcession = async (id: number) => {
  return concessionApi.delete(id);
}; 