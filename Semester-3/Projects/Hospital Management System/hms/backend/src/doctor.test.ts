import { describe, expect, it } from 'vitest';
import type {
  CreateDoctorInput,
  Doctor,
  DoctorFilters,
  DoctorListResult,
  UpdateDoctorInput,
} from './models/Doctor.js';
import type { IDoctorRepository } from './repositories/DoctorRepository.js';
import { DoctorService } from './services/DoctorService.js';

class InMemoryDoctorRepository implements IDoctorRepository {
  private readonly doctors = new Map<string, Doctor>();
  private sequence = 1;

  public async create(input: CreateDoctorInput): Promise<Doctor> {
    const id = `doctor-${this.sequence}`;
    const doctor: Doctor = {
      id,
      doctorId: `DOC-${String(this.sequence++).padStart(6, '0')}`,
      ...input,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.doctors.set(id, doctor);
    return doctor;
  }

  public async findById(identifier: string): Promise<Doctor | null> {
    return [...this.doctors.values()].find(
      (doctor) => doctor.id === identifier || doctor.doctorId === identifier,
    ) ?? null;
  }

  public async list(filters: DoctorFilters): Promise<DoctorListResult> {
    let doctors = [...this.doctors.values()];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      doctors = doctors.filter((doctor) =>
        [doctor.doctorId, doctor.name, doctor.specialization, doctor.department, doctor.email]
          .some((value) => value.toLowerCase().includes(search)),
      );
    }
    if (filters.specialization) doctors = doctors.filter((doctor) => doctor.specialization === filters.specialization);
    if (filters.department) doctors = doctors.filter((doctor) => doctor.department === filters.department);
    if (filters.availableDay) doctors = doctors.filter((doctor) => doctor.availability.some((slot) => slot.day === filters.availableDay));
    if (filters.minFee !== undefined) doctors = doctors.filter((doctor) => doctor.consultationFee >= filters.minFee!);
    if (filters.maxFee !== undefined) doctors = doctors.filter((doctor) => doctor.consultationFee <= filters.maxFee!);
    return {
      doctors,
      pagination: { page: filters.page, limit: filters.limit, total: doctors.length, totalPages: doctors.length ? 1 : 0 },
      filterOptions: {
        specializations: [...new Set([...this.doctors.values()].map((doctor) => doctor.specialization))],
        departments: [...new Set([...this.doctors.values()].map((doctor) => doctor.department))],
      },
    };
  }

  public async update(id: string, input: UpdateDoctorInput): Promise<Doctor | null> {
    const doctor = this.doctors.get(id);
    if (!doctor) return null;
    const updated = { ...doctor, ...input, updatedAt: new Date().toISOString() };
    this.doctors.set(id, updated);
    return updated;
  }

  public async softDelete(id: string): Promise<boolean> {
    return this.doctors.delete(id);
  }
}

const validInput: CreateDoctorInput = {
  name: 'Dr. Workflow Test',
  specialization: 'Cardiology',
  department: 'Medicine',
  phone: '+91 90000 33333',
  email: 'doctor.workflow@example.test',
  room: 'M-201',
  consultationFee: 750,
  availability: [
    { day: 'Monday', startTime: '09:00', endTime: '13:00' },
    { day: 'Thursday', startTime: '14:00', endTime: '18:00' },
  ],
};

const filters = (changes: Partial<DoctorFilters> = {}): DoctorFilters => ({ page: 1, limit: 20, ...changes });

describe('Phase 4 doctor service', () => {
  it('creates and reads a doctor with a generated doctor number', async () => {
    const service = new DoctorService(new InMemoryDoctorRepository());
    const created = await service.createDoctor(validInput);
    const read = await service.getDoctor(created.doctorId);

    expect(created.doctorId).toMatch(/^DOC-\d{6}$/);
    expect(read.id).toBe(created.id);
  });

  it('updates selected fields without resetting availability', async () => {
    const service = new DoctorService(new InMemoryDoctorRepository());
    const created = await service.createDoctor(validInput);
    const updated = await service.updateDoctor(created.id, { room: 'M-202', consultationFee: 800 });

    expect(updated.room).toBe('M-202');
    expect(updated.consultationFee).toBe(800);
    expect(updated.availability).toEqual(validInput.availability);
  });

  it('searches and combines doctor filters', async () => {
    const service = new DoctorService(new InMemoryDoctorRepository());
    await service.createDoctor(validInput);
    const result = await service.listDoctors(filters({
      search: 'workflow',
      specialization: 'Cardiology',
      department: 'Medicine',
      availableDay: 'Monday',
      minFee: 700,
      maxFee: 800,
    }));

    expect(result.pagination.total).toBe(1);
    expect(result.doctors[0]?.name).toBe(validInput.name);
  });

  it('rejects duplicate days and invalid time ranges', async () => {
    const service = new DoctorService(new InMemoryDoctorRepository());
    await expect(service.createDoctor({
      ...validInput,
      availability: [
        { day: 'Monday', startTime: '14:00', endTime: '12:00' },
        { day: 'Monday', startTime: '15:00', endTime: '17:00' },
      ],
    })).rejects.toMatchObject({ statusCode: 400, code: 'INVALID_AVAILABILITY' });
  });

  it('soft deletes a doctor so the profile can no longer be read', async () => {
    const service = new DoctorService(new InMemoryDoctorRepository());
    const created = await service.createDoctor(validInput);
    await service.deleteDoctor(created.id);

    await expect(service.getDoctor(created.id)).rejects.toMatchObject({
      statusCode: 404,
      code: 'DOCTOR_NOT_FOUND',
    });
  });
});
