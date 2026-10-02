import type pg from 'pg';
import type {
  BloodGroup,
  CreatePatientInput,
  Patient,
  PatientFilters,
  PatientGender,
  PatientListResult,
  UpdatePatientInput,
} from '../models/Patient.js';

interface PatientRow {
  id: string;
  patient_id: string;
  full_name: string;
  age: number;
  date_of_birth: string | Date;
  gender: PatientGender;
  blood_group: BloodGroup;
  phone: string;
  email: string | null;
  address: string;
  emergency_contact: string;
  reason_for_visit: string;
  medical_history: string | null;
  registration_date: Date;
  updated_at: Date;
}

const PATIENT_COLUMNS = `
  id, patient_id, full_name,
  EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth))::INTEGER AS age,
  date_of_birth, gender, blood_group, phone, email, address,
  emergency_contact, reason_for_visit, medical_history,
  registration_date, updated_at
`;

const mapPatientRow = (row: PatientRow): Patient => ({
  id: row.id,
  patientId: row.patient_id,
  fullName: row.full_name,
  age: row.age,
  dateOfBirth:
    row.date_of_birth instanceof Date
      ? row.date_of_birth.toISOString().slice(0, 10)
      : row.date_of_birth,
  gender: row.gender,
  bloodGroup: row.blood_group,
  phone: row.phone,
  email: row.email,
  address: row.address,
  emergencyContact: row.emergency_contact,
  reasonForVisit: row.reason_for_visit,
  medicalHistory: row.medical_history,
  registrationDate: row.registration_date.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export interface IPatientRepository {
  create(input: CreatePatientInput): Promise<Patient>;
  findById(identifier: string): Promise<Patient | null>;
  list(filters: PatientFilters): Promise<PatientListResult>;
  update(id: string, input: UpdatePatientInput): Promise<Patient | null>;
  softDelete(id: string): Promise<boolean>;
}

export class PostgreSQLPatientRepository implements IPatientRepository {
  public constructor(private readonly pool: pg.Pool) {}

  public async create(input: CreatePatientInput): Promise<Patient> {
    const result = await this.pool.query<PatientRow>(
      `INSERT INTO patients (
         full_name, date_of_birth, gender, blood_group, phone, email,
         address, emergency_contact, reason_for_visit, medical_history
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING ${PATIENT_COLUMNS}`,
      [
        input.fullName,
        input.dateOfBirth,
        input.gender,
        input.bloodGroup,
        input.phone,
        input.email,
        input.address,
        input.emergencyContact,
        input.reasonForVisit,
        input.medicalHistory,
      ],
    );
    return mapPatientRow(result.rows[0]!);
  }

  public async findById(identifier: string): Promise<Patient | null> {
    const result = await this.pool.query<PatientRow>(
      `SELECT ${PATIENT_COLUMNS}
       FROM patients
       WHERE (id::TEXT = $1 OR patient_id = $1) AND deleted_at IS NULL
       LIMIT 1`,
      [identifier],
    );
    const row = result.rows[0];
    return row ? mapPatientRow(row) : null;
  }

  public async list(filters: PatientFilters): Promise<PatientListResult> {
    const conditions = ['deleted_at IS NULL'];
    const values: unknown[] = [];
    const addValue = (value: unknown): string => {
      values.push(value);
      return `$${values.length}`;
    };

    if (filters.search) {
      const parameter = addValue(`%${filters.search}%`);
      conditions.push(`(
        patient_id ILIKE ${parameter} OR full_name ILIKE ${parameter} OR
        phone ILIKE ${parameter} OR COALESCE(email, '') ILIKE ${parameter} OR
        reason_for_visit ILIKE ${parameter}
      )`);
    }
    if (filters.gender) conditions.push(`gender = ${addValue(filters.gender)}`);
    if (filters.bloodGroup) conditions.push(`blood_group = ${addValue(filters.bloodGroup)}`);
    if (filters.minAge !== undefined) {
      conditions.push(`EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) >= ${addValue(filters.minAge)}`);
    }
    if (filters.maxAge !== undefined) {
      conditions.push(`EXTRACT(YEAR FROM AGE(CURRENT_DATE, date_of_birth)) <= ${addValue(filters.maxAge)}`);
    }

    const whereClause = conditions.join(' AND ');
    const countResult = await this.pool.query<{ total: string }>(
      `SELECT COUNT(*)::TEXT AS total FROM patients WHERE ${whereClause}`,
      values,
    );
    const total = Number.parseInt(countResult.rows[0]?.total ?? '0', 10);
    const offset = (filters.page - 1) * filters.limit;
    const dataValues = [...values, filters.limit, offset];
    const limitParameter = `$${values.length + 1}`;
    const offsetParameter = `$${values.length + 2}`;

    const result = await this.pool.query<PatientRow>(
      `SELECT ${PATIENT_COLUMNS}
       FROM patients
       WHERE ${whereClause}
       ORDER BY registration_date DESC, patient_id DESC
       LIMIT ${limitParameter} OFFSET ${offsetParameter}`,
      dataValues,
    );

    return {
      patients: result.rows.map(mapPatientRow),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
    };
  }

  public async update(id: string, input: UpdatePatientInput): Promise<Patient | null> {
    const columnMap: Array<[keyof UpdatePatientInput, string]> = [
      ['fullName', 'full_name'],
      ['dateOfBirth', 'date_of_birth'],
      ['gender', 'gender'],
      ['bloodGroup', 'blood_group'],
      ['phone', 'phone'],
      ['email', 'email'],
      ['address', 'address'],
      ['emergencyContact', 'emergency_contact'],
      ['reasonForVisit', 'reason_for_visit'],
      ['medicalHistory', 'medical_history'],
    ];
    const values: unknown[] = [];
    const assignments: string[] = [];

    for (const [property, column] of columnMap) {
      if (input[property] !== undefined) {
        values.push(input[property]);
        assignments.push(`${column} = $${values.length}`);
      }
    }

    values.push(id);
    const result = await this.pool.query<PatientRow>(
      `UPDATE patients
       SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id::TEXT = $${values.length} AND deleted_at IS NULL
       RETURNING ${PATIENT_COLUMNS}`,
      values,
    );
    const row = result.rows[0];
    return row ? mapPatientRow(row) : null;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE patients
       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id::TEXT = $1 AND deleted_at IS NULL`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
