import { describe, expect, it } from 'vitest';
import type {
  CreatePatientInput,
  Patient,
  PatientFilters,
  PatientListResult,
  UpdatePatientInput,
} from './models/Patient.js';
import type { IPatientRepository } from './repositories/PatientRepository.js';
import { PatientService } from './services/PatientService.js';

const ageFromDate = (dateOfBirth: string): number => {
  const birth = new Date(`${dateOfBirth}T00:00:00Z`);
  const now = new Date();
  let age = now.getUTCFullYear() - birth.getUTCFullYear();
  if (
    now.getUTCMonth() < birth.getUTCMonth() ||
    (now.getUTCMonth() === birth.getUTCMonth() && now.getUTCDate() < birth.getUTCDate())
  ) age -= 1;
  return age;
};

class InMemoryPatientRepository implements IPatientRepository {
  private readonly patients = new Map<string, Patient>();
  private sequence = 1;

  public async create(input: CreatePatientInput): Promise<Patient> {
    const id = `patient-${this.sequence}`;
    const patient: Patient = {
      id,
      patientId: `PAT-${String(this.sequence++).padStart(6, '0')}`,
      ...input,
      age: ageFromDate(input.dateOfBirth),
      registrationDate: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.patients.set(id, patient);
    return patient;
  }

  public async findById(identifier: string): Promise<Patient | null> {
    return [...this.patients.values()].find(
      (patient) => patient.id === identifier || patient.patientId === identifier,
    ) ?? null;
  }

  public async list(filters: PatientFilters): Promise<PatientListResult> {
    let results = [...this.patients.values()];
    if (filters.search) {
      const search = filters.search.toLowerCase();
      results = results.filter((patient) =>
        [patient.patientId, patient.fullName, patient.phone, patient.email ?? '']
          .some((value) => value.toLowerCase().includes(search)),
      );
    }
    if (filters.gender) results = results.filter((patient) => patient.gender === filters.gender);
    if (filters.bloodGroup) results = results.filter((patient) => patient.bloodGroup === filters.bloodGroup);
    if (filters.minAge !== undefined) results = results.filter((patient) => patient.age >= filters.minAge!);
    if (filters.maxAge !== undefined) results = results.filter((patient) => patient.age <= filters.maxAge!);
    return {
      patients: results,
      pagination: { page: filters.page, limit: filters.limit, total: results.length, totalPages: results.length ? 1 : 0 },
    };
  }

  public async update(id: string, input: UpdatePatientInput): Promise<Patient | null> {
    const patient = this.patients.get(id);
    if (!patient) return null;
    const updated = {
      ...patient,
      ...input,
      ...(input.dateOfBirth ? { age: ageFromDate(input.dateOfBirth) } : {}),
      updatedAt: new Date().toISOString(),
    };
    this.patients.set(id, updated);
    return updated;
  }

  public async softDelete(id: string): Promise<boolean> {
    return this.patients.delete(id);
  }
}

const validInput: CreatePatientInput = {
  fullName: 'Patient Workflow Test',
  dateOfBirth: '1990-06-15',
  gender: 'Female',
  bloodGroup: 'A+',
  phone: '+91 90000 11111',
  email: 'patient@example.test',
  address: 'Test Address, Pune',
  emergencyContact: 'Emergency Contact +91 98888 11111',
  reasonForVisit: 'Routine consultation',
  medicalHistory: 'No known conditions',
};

const filters = (changes: Partial<PatientFilters> = {}): PatientFilters => ({
  page: 1,
  limit: 20,
  ...changes,
});

describe('Phase 3 patient service', () => {
  it('creates and reads a patient with a generated patient number and computed age', async () => {
    const service = new PatientService(new InMemoryPatientRepository());
    const created = await service.createPatient(validInput);
    const read = await service.getPatient(created.id);

    expect(created.patientId).toMatch(/^PAT-\d{6}$/);
    expect(created.age).toBe(ageFromDate(validInput.dateOfBirth));
    expect(read.id).toBe(created.id);
  });

  it('updates only supplied fields without resetting existing values', async () => {
    const service = new PatientService(new InMemoryPatientRepository());
    const created = await service.createPatient(validInput);
    const updated = await service.updatePatient(created.id, { phone: '+91 92222 33333' });

    expect(updated.phone).toBe('+91 92222 33333');
    expect(updated.bloodGroup).toBe('A+');
    expect(updated.email).toBe('patient@example.test');
  });

  it('searches and filters patient records', async () => {
    const service = new PatientService(new InMemoryPatientRepository());
    await service.createPatient(validInput);

    const result = await service.listPatients(filters({
      search: 'workflow',
      gender: 'Female',
      bloodGroup: 'A+',
      minAge: ageFromDate(validInput.dateOfBirth),
      maxAge: ageFromDate(validInput.dateOfBirth),
    }));

    expect(result.pagination.total).toBe(1);
    expect(result.patients[0]?.fullName).toBe(validInput.fullName);
  });

  it('soft deletes a patient so it can no longer be read', async () => {
    const service = new PatientService(new InMemoryPatientRepository());
    const created = await service.createPatient(validInput);
    await service.deletePatient(created.id);

    await expect(service.getPatient(created.id)).rejects.toMatchObject({
      statusCode: 404,
      code: 'PATIENT_NOT_FOUND',
    });
  });

  it('rejects a future date of birth', async () => {
    const service = new PatientService(new InMemoryPatientRepository());
    await expect(service.createPatient({ ...validInput, dateOfBirth: '2999-01-01' })).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_DATE_OF_BIRTH',
    });
  });
});
