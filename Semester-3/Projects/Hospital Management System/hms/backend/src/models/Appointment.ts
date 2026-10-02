import type { DoctorAvailabilitySlot } from './Doctor.js';

export const APPOINTMENT_STATUSES = ['Scheduled', 'Completed', 'Cancelled', 'No Show'] as const;
export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export interface Appointment {
  id: string;
  appointmentId: string;
  patient: { id: string; patientId: string; fullName: string };
  doctor: { id: string; doctorId: string; name: string; specialization: string };
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: AppointmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentInput {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  reason: string;
  status: AppointmentStatus;
  notes: string | null;
}
export type UpdateAppointmentInput = Partial<CreateAppointmentInput>;

export interface AppointmentFilters {
  search?: string;
  status?: AppointmentStatus;
  doctorId?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  limit: number;
}

export interface AppointmentListResult {
  appointments: Appointment[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface AppointmentOptions {
  patients: Array<{ id: string; patientId: string; fullName: string }>;
  doctors: Array<{
    id: string;
    doctorId: string;
    name: string;
    specialization: string;
    availability: DoctorAvailabilitySlot[];
  }>;
}
