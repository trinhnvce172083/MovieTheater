import axiosClient from "./axiosClient";
import { Concession } from "@/types/Concession"; // Assuming you have this type definition

const concessionApi = {
  getAll: () => {
    const url = "/concessions";
    return axiosClient.get(url);
  },
  add: (concession: Omit<Concession, 'id'>) => {
    const url = "/concessions";
    return axiosClient.post(url, concession);
  },
  update: (id: number, concession: Partial<Concession>) => {
    const url = `/concessions/${id}`;
    return axiosClient.put(url, concession);
  },
  delete: (id: number) => {
    const url = `/concessions/${id}`;
    return axiosClient.delete(url);
  },
};

export default concessionApi; 