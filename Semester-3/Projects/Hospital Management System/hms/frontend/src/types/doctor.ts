export const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] as const;
export type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

export interface DoctorAvailabilitySlot {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
}

export interface Doctor {
  id: string;
  doctorId: string;
  name: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  room: string;
  consultationFee: number;
  availability: DoctorAvailabilitySlot[];
  createdAt: string;
  updatedAt: string;
}

export interface DoctorPayload {
  name: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  room: string;
  consultationFee: number;
  availability: DoctorAvailabilitySlot[];
}

export interface DoctorFilters {
  search?: string;
  specialization?: string;
  department?: string;
  availableDay?: DayOfWeek;
  minFee?: number;
  maxFee?: number;
  page?: number;
  limit?: number;
}

export interface DoctorListResponse {
  doctors: Doctor[];
  pagination: { page: number; limit: number; total: number; totalPages: number; };
  filterOptions: { specializations: string[]; departments: string[]; };
}
