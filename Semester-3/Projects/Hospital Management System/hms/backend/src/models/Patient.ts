export const PATIENT_GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'] as const;
export type PatientGender = (typeof PATIENT_GENDERS)[number];

export const BLOOD_GROUPS = [
  'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown',
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export interface Patient {
  id: string;
  patientId: string;
  fullName: string;
  age: number;
  dateOfBirth: string;
  gender: PatientGender;
  bloodGroup: BloodGroup;
  phone: string;
  email: string | null;
  address: string;
  emergencyContact: string;
  reasonForVisit: string;
  medicalHistory: string | null;
  registrationDate: string;
  updatedAt: string;
}

export interface CreatePatientInput {
  fullName: string;
  dateOfBirth: string;
  gender: PatientGender;
  bloodGroup: BloodGroup;
  phone: string;
  email: string | null;
  address: string;
  emergencyContact: string;
  reasonForVisit: string;
  medicalHistory: string | null;
}

export type UpdatePatientInput = Partial<CreatePatientInput>;

export interface PatientFilters {
  search?: string;
  gender?: PatientGender;
  bloodGroup?: BloodGroup;
  minAge?: number;
  maxAge?: number;
  page: number;
  limit: number;
}

export interface PatientListResult {
  patients: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
