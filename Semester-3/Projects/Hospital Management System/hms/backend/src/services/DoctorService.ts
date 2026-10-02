import type {
  CreateDoctorInput,
  Doctor,
  DoctorAvailabilitySlot,
  DoctorFilters,
  DoctorListResult,
  UpdateDoctorInput,
} from '../models/Doctor.js';
import type { IDoctorRepository } from '../repositories/DoctorRepository.js';
import { AppError } from '../utils/AppError.js';

export class DoctorService {
  public constructor(private readonly doctorRepository: IDoctorRepository) {}

  public async createDoctor(input: CreateDoctorInput): Promise<Doctor> {
    this.validateAvailability(input.availability);
    try {
      return await this.doctorRepository.create(this.normalizeInput(input) as CreateDoctorInput);
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  public async getDoctor(identifier: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findById(identifier);
    if (!doctor) throw new AppError(404, 'DOCTOR_NOT_FOUND', 'Doctor was not found.');
    return doctor;
  }

  public async listDoctors(filters: DoctorFilters): Promise<DoctorListResult> {
    return this.doctorRepository.list({
      ...filters,
      ...(filters.search ? { search: filters.search.trim() } : {}),
    });
  }

  public async updateDoctor(id: string, input: UpdateDoctorInput): Promise<Doctor> {
    if (input.availability) this.validateAvailability(input.availability);
    await this.getDoctor(id);
    try {
      const doctor = await this.doctorRepository.update(id, this.normalizeInput(input));
      if (!doctor) throw new AppError(404, 'DOCTOR_NOT_FOUND', 'Doctor was not found.');
      return doctor;
    } catch (error) {
      this.handlePersistenceError(error);
    }
  }

  public async deleteDoctor(id: string): Promise<void> {
    await this.getDoctor(id);
    if (!(await this.doctorRepository.softDelete(id))) {
      throw new AppError(404, 'DOCTOR_NOT_FOUND', 'Doctor was not found.');
    }
  }

  private validateAvailability(slots: DoctorAvailabilitySlot[]): void {
    const uniqueDays = new Set(slots.map((slot) => slot.day));
    if (uniqueDays.size !== slots.length) {
      throw new AppError(400, 'INVALID_AVAILABILITY', 'Availability can contain only one schedule per day.');
    }
    if (slots.some((slot) => slot.startTime >= slot.endTime)) {
      throw new AppError(400, 'INVALID_AVAILABILITY', 'Availability end time must be after start time.');
    }
  }

  private normalizeInput<T extends CreateDoctorInput | UpdateDoctorInput>(input: T): T {
    const normalized: UpdateDoctorInput = { ...input };
    if (input.name !== undefined) normalized.name = input.name.trim();
    if (input.specialization !== undefined) normalized.specialization = input.specialization.trim();
    if (input.department !== undefined) normalized.department = input.department.trim();
    if (input.phone !== undefined) normalized.phone = input.phone.trim();
    if (input.email !== undefined) normalized.email = input.email.trim().toLowerCase();
    if (input.room !== undefined) normalized.room = input.room.trim();
    if (input.consultationFee !== undefined) {
      normalized.consultationFee = Math.round(input.consultationFee * 100) / 100;
    }
    return normalized as T;
  }

  private handlePersistenceError(error: unknown): never {
    if (
      typeof error === 'object' && error !== null &&
      'code' in error && (error as { code?: string }).code === '23505'
    ) {
      throw new AppError(409, 'DOCTOR_EMAIL_EXISTS', 'A doctor with this email already exists.');
    }
    throw error;
  }
}
