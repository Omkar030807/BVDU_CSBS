import type pg from 'pg';
import type {
  CreateDoctorInput,
  Doctor,
  DoctorAvailabilitySlot,
  DoctorFilters,
  DoctorListResult,
  UpdateDoctorInput,
} from '../models/Doctor.js';

interface DoctorRow {
  id: string;
  doctor_id: string;
  name: string;
  specialization: string;
  department: string;
  phone: string;
  email: string;
  room: string;
  consultation_fee: string;
  availability: DoctorAvailabilitySlot[];
  created_at: Date;
  updated_at: Date;
}

const DOCTOR_COLUMNS = `
  id, doctor_id, name, specialization, department, phone, email,
  room, consultation_fee, availability, created_at, updated_at
`;

const mapDoctorRow = (row: DoctorRow): Doctor => ({
  id: row.id,
  doctorId: row.doctor_id,
  name: row.name,
  specialization: row.specialization,
  department: row.department,
  phone: row.phone,
  email: row.email,
  room: row.room,
  consultationFee: Number(row.consultation_fee),
  availability: row.availability,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
});

export interface IDoctorRepository {
  create(input: CreateDoctorInput): Promise<Doctor>;
  findById(identifier: string): Promise<Doctor | null>;
  list(filters: DoctorFilters): Promise<DoctorListResult>;
  update(id: string, input: UpdateDoctorInput): Promise<Doctor | null>;
  softDelete(id: string): Promise<boolean>;
}

export class PostgreSQLDoctorRepository implements IDoctorRepository {
  public constructor(private readonly pool: pg.Pool) {}

  public async create(input: CreateDoctorInput): Promise<Doctor> {
    const result = await this.pool.query<DoctorRow>(
      `INSERT INTO doctors (
         name, specialization, department, phone, email, room,
         consultation_fee, availability
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8::JSONB)
       RETURNING ${DOCTOR_COLUMNS}`,
      [
        input.name,
        input.specialization,
        input.department,
        input.phone,
        input.email,
        input.room,
        input.consultationFee,
        JSON.stringify(input.availability),
      ],
    );
    return mapDoctorRow(result.rows[0]!);
  }

  public async findById(identifier: string): Promise<Doctor | null> {
    const result = await this.pool.query<DoctorRow>(
      `SELECT ${DOCTOR_COLUMNS}
       FROM doctors
       WHERE (id::TEXT = $1 OR doctor_id = $1) AND deleted_at IS NULL
       LIMIT 1`,
      [identifier],
    );
    const row = result.rows[0];
    return row ? mapDoctorRow(row) : null;
  }

  public async list(filters: DoctorFilters): Promise<DoctorListResult> {
    const conditions = ['deleted_at IS NULL'];
    const values: unknown[] = [];
    const addValue = (value: unknown): string => {
      values.push(value);
      return `$${values.length}`;
    };

    if (filters.search) {
      const parameter = addValue(`%${filters.search}%`);
      conditions.push(`(
        doctor_id ILIKE ${parameter} OR name ILIKE ${parameter} OR
        specialization ILIKE ${parameter} OR department ILIKE ${parameter} OR
        email ILIKE ${parameter} OR phone ILIKE ${parameter} OR room ILIKE ${parameter}
      )`);
    }
    if (filters.specialization) {
      conditions.push(`LOWER(specialization) = LOWER(${addValue(filters.specialization)})`);
    }
    if (filters.department) {
      conditions.push(`LOWER(department) = LOWER(${addValue(filters.department)})`);
    }
    if (filters.availableDay) {
      conditions.push(`availability @> ${addValue(JSON.stringify([{ day: filters.availableDay }]))}::JSONB`);
    }
    if (filters.minFee !== undefined) {
      conditions.push(`consultation_fee >= ${addValue(filters.minFee)}`);
    }
    if (filters.maxFee !== undefined) {
      conditions.push(`consultation_fee <= ${addValue(filters.maxFee)}`);
    }

    const whereClause = conditions.join(' AND ');
    const offset = (filters.page - 1) * filters.limit;
    const dataValues = [...values, filters.limit, offset];
    const limitParameter = `$${values.length + 1}`;
    const offsetParameter = `$${values.length + 2}`;

    const [countResult, doctorsResult, specializationResult, departmentResult] = await Promise.all([
      this.pool.query<{ total: string }>(
        `SELECT COUNT(*)::TEXT AS total FROM doctors WHERE ${whereClause}`,
        values,
      ),
      this.pool.query<DoctorRow>(
        `SELECT ${DOCTOR_COLUMNS}
         FROM doctors
         WHERE ${whereClause}
         ORDER BY name ASC, doctor_id ASC
         LIMIT ${limitParameter} OFFSET ${offsetParameter}`,
        dataValues,
      ),
      this.pool.query<{ specialization: string }>(
        `SELECT DISTINCT specialization FROM doctors
         WHERE deleted_at IS NULL ORDER BY specialization ASC`,
      ),
      this.pool.query<{ department: string }>(
        `SELECT DISTINCT department FROM doctors
         WHERE deleted_at IS NULL ORDER BY department ASC`,
      ),
    ]);

    const total = Number.parseInt(countResult.rows[0]?.total ?? '0', 10);
    return {
      doctors: doctorsResult.rows.map(mapDoctorRow),
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
      },
      filterOptions: {
        specializations: specializationResult.rows.map((row) => row.specialization),
        departments: departmentResult.rows.map((row) => row.department),
      },
    };
  }

  public async update(id: string, input: UpdateDoctorInput): Promise<Doctor | null> {
    const columnMap: Array<[keyof UpdateDoctorInput, string]> = [
      ['name', 'name'],
      ['specialization', 'specialization'],
      ['department', 'department'],
      ['phone', 'phone'],
      ['email', 'email'],
      ['room', 'room'],
      ['consultationFee', 'consultation_fee'],
      ['availability', 'availability'],
    ];
    const values: unknown[] = [];
    const assignments: string[] = [];

    for (const [property, column] of columnMap) {
      if (input[property] !== undefined) {
        const value = property === 'availability'
          ? JSON.stringify(input.availability)
          : input[property];
        values.push(value);
        assignments.push(`${column} = $${values.length}${property === 'availability' ? '::JSONB' : ''}`);
      }
    }

    values.push(id);
    const result = await this.pool.query<DoctorRow>(
      `UPDATE doctors
       SET ${assignments.join(', ')}, updated_at = CURRENT_TIMESTAMP
       WHERE id::TEXT = $${values.length} AND deleted_at IS NULL
       RETURNING ${DOCTOR_COLUMNS}`,
      values,
    );
    const row = result.rows[0];
    return row ? mapDoctorRow(row) : null;
  }

  public async softDelete(id: string): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE doctors
       SET deleted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
       WHERE id::TEXT = $1 AND deleted_at IS NULL`,
      [id],
    );
    return (result.rowCount ?? 0) > 0;
  }
}
