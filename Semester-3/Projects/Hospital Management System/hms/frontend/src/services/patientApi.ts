import type { Patient, PatientFilters, PatientListResponse, PatientPayload } from '../types/patient';
import { apiRequest } from './api';

export const listPatientsRequest = async (filters: PatientFilters): Promise<PatientListResponse> => {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') query.set(key, String(value));
  }
  return apiRequest<PatientListResponse>(`/patients?${query.toString()}`);
};

export const getPatientRequest = async (id: string): Promise<Patient> => {
  const response = await apiRequest<{ patient: Patient }>(`/patients/${id}`);
  return response.patient;
};

export const createPatientRequest = async (payload: PatientPayload): Promise<Patient> => {
  const response = await apiRequest<{ patient: Patient }>('/patients', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.patient;
};

export const updatePatientRequest = async (id: string, payload: PatientPayload): Promise<Patient> => {
  const response = await apiRequest<{ patient: Patient }>(`/patients/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
  return response.patient;
};

export const deletePatientRequest = async (id: string): Promise<void> => {
  await apiRequest<void>(`/patients/${id}`, { method: 'DELETE' });
};
