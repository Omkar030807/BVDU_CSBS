import type {
  CreatePatientInput,
  Patient,
  PatientFilters,
  PatientListResult,
  UpdatePatientInput,
} from '../models/Patient.js';
import type { IPatientRepository } from '../repositories/PatientRepository.js';
import { AppError } from '../utils/AppError.js';

export class PatientService {
  public constructor(private readonly patientRepository: IPatientRepository) {}

  public async createPatient(input: CreatePatientInput): Promise<Patient> {
    this.validateDateOfBirth(input.dateOfBirth);
    return this.patientRepository.create(this.normalizeInput(input) as CreatePatientInput);
  }

  public async getPatient(identifier: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(identifier);
    if (!patient) throw new AppError(404, 'PATIENT_NOT_FOUND', 'Patient was not found.');
    return patient;
  }

  public async listPatients(filters: PatientFilters): Promise<PatientListResult> {
    return this.patientRepository.list({
      ...filters,
      ...(filters.search ? { search: filters.search.trim() } : {}),
    });
  }

  public async updatePatient(id: string, input: UpdatePatientInput): Promise<Patient> {
    if (input.dateOfBirth) this.validateDateOfBirth(input.dateOfBirth);
    await this.getPatient(id);
    const patient = await this.patientRepository.update(id, this.normalizeInput(input));
    if (!patient) throw new AppError(404, 'PATIENT_NOT_FOUND', 'Patient was not found.');
    return patient;
  }

  public async deletePatient(id: string): Promise<void> {
    await this.getPatient(id);
    const deleted = await this.patientRepository.softDelete(id);
    if (!deleted) throw new AppError(404, 'PATIENT_NOT_FOUND', 'Patient was not found.');
  }

  private validateDateOfBirth(dateOfBirth: string): void {
    const today = new Date().toISOString().slice(0, 10);
    if (dateOfBirth > today) {
      throw new AppError(400, 'INVALID_DATE_OF_BIRTH', 'Date of birth cannot be in the future.');
    }
    if (dateOfBirth < '1900-01-01') {
      throw new AppError(400, 'INVALID_DATE_OF_BIRTH', 'Date of birth is outside the supported range.');
    }
  }

  private normalizeInput<T extends CreatePatientInput | UpdatePatientInput>(input: T): T {
    const normalized: UpdatePatientInput = { ...input };
    if (input.fullName !== undefined) normalized.fullName = input.fullName.trim();
    if (input.phone !== undefined) normalized.phone = input.phone.trim();
    if (input.email !== undefined) normalized.email = input.email?.trim().toLowerCase() || null;
    if (input.address !== undefined) normalized.address = input.address.trim();
    if (input.emergencyContact !== undefined) normalized.emergencyContact = input.emergencyContact.trim();
    if (input.reasonForVisit !== undefined) normalized.reasonForVisit = input.reasonForVisit.trim();
    if (input.medicalHistory !== undefined) normalized.medicalHistory = input.medicalHistory?.trim() || null;
    return normalized as T;
  }
}
