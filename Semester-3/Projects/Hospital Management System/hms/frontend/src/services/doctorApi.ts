import type { Doctor, DoctorFilters, DoctorListResponse, DoctorPayload } from '../types/doctor';
import { apiRequest } from './api';

export const listDoctorsRequest = async (filters: DoctorFilters): Promise<DoctorListResponse> => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  return apiRequest<DoctorListResponse>(`/doctors?${query.toString()}`);
};

export const createDoctorRequest = async (payload: DoctorPayload): Promise<Doctor> => {
  const response = await apiRequest<{ doctor: Doctor }>('/doctors', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.doctor;
};

export const updateDoctorRequest = async (id: string, payload: DoctorPayload): Promise<Doctor> => {
  const response = await apiRequest<{ doctor: Doctor }>(`/doctors/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return response.doctor;
};

export const deleteDoctorRequest = async (id: string): Promise<void> => {
  await apiRequest<void>(`/doctors/${id}`, { method: 'DELETE' });
};
