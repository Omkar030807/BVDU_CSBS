import { LoaderCircle, Save } from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import {
  BLOOD_GROUPS,
  PATIENT_GENDERS,
  type BloodGroup,
  type Patient,
  type PatientGender,
  type PatientPayload,
} from '../types/patient';

interface PatientFormProps {
  patient?: Patient;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: (payload: PatientPayload) => Promise<void>;
  onCancel: () => void;
}

interface FormState {
  fullName: string;
  dateOfBirth: string;
  gender: PatientGender;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  address: string;
  emergencyContact: string;
  reasonForVisit: string;
  medicalHistory: string;
}

const initialState = (patient?: Patient): FormState => ({
  fullName: patient?.fullName ?? '',
  dateOfBirth: patient?.dateOfBirth ?? '',
  gender: patient?.gender ?? 'Female',
  bloodGroup: patient?.bloodGroup ?? 'Unknown',
  phone: patient?.phone ?? '',
  email: patient?.email ?? '',
  address: patient?.address ?? '',
  emergencyContact: patient?.emergencyContact ?? '',
  reasonForVisit: patient?.reasonForVisit ?? '',
  medicalHistory: patient?.medicalHistory ?? '',
});

const calculateAge = (dateOfBirth: string): number | null => {
  if (!dateOfBirth) return null;
  const birth = new Date(`${dateOfBirth}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  if (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate())) age -= 1;
  return age;
};

export const PatientForm = ({ patient, isSubmitting, error, onSubmit, onCancel }: PatientFormProps) => {
  const [form, setForm] = useState<FormState>(() => initialState(patient));
  const age = useMemo(() => calculateAge(form.dateOfBirth), [form.dateOfBirth]);
  const today = new Date().toISOString().slice(0, 10);

  const setField = <K extends keyof FormState>(field: K, value: FormState[K]): void => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    await onSubmit({
      ...form,
      email: form.email.trim() || null,
      medicalHistory: form.medicalHistory.trim() || null,
    });
  };

  return (
    <form className="patient-form" onSubmit={(event) => void handleSubmit(event)}>
      {error && <div className="form-error patient-form__error" role="alert"><strong>Could not save patient</strong><span>{error}</span></div>}

      <fieldset disabled={isSubmitting}>
        <legend>Personal information</legend>
        <div className="form-grid form-grid--3">
          <label className="form-field form-field--wide"><span>Full name *</span><input required minLength={2} maxLength={120} value={form.fullName} onChange={(event) => setField('fullName', event.target.value)} placeholder="Patient's full legal name" /></label>
          <label className="form-field"><span>Date of birth *</span><input required type="date" min="1900-01-01" max={today} value={form.dateOfBirth} onChange={(event) => setField('dateOfBirth', event.target.value)} /></label>
          <label className="form-field"><span>Age</span><input readOnly value={age === null ? 'Calculated from DOB' : `${age} years`} /></label>
          <label className="form-field"><span>Gender *</span><select required value={form.gender} onChange={(event) => setField('gender', event.target.value as PatientGender)}>{PATIENT_GENDERS.map((gender) => <option key={gender}>{gender}</option>)}</select></label>
          <label className="form-field"><span>Blood group *</span><select required value={form.bloodGroup} onChange={(event) => setField('bloodGroup', event.target.value as BloodGroup)}>{BLOOD_GROUPS.map((group) => <option key={group}>{group}</option>)}</select></label>
        </div>
      </fieldset>

      <fieldset disabled={isSubmitting}>
        <legend>Contact information</legend>
        <div className="form-grid form-grid--2">
          <label className="form-field"><span>Phone *</span><input required minLength={7} maxLength={20} value={form.phone} onChange={(event) => setField('phone', event.target.value)} placeholder="+91 98765 43210" /></label>
          <label className="form-field"><span>Email</span><input type="email" maxLength={255} value={form.email} onChange={(event) => setField('email', event.target.value)} placeholder="patient@example.com" /></label>
          <label className="form-field form-field--full"><span>Address *</span><textarea required minLength={5} maxLength={1000} rows={2} value={form.address} onChange={(event) => setField('address', event.target.value)} placeholder="Complete residential address" /></label>
          <label className="form-field form-field--full"><span>Emergency contact *</span><input required minLength={3} maxLength={255} value={form.emergencyContact} onChange={(event) => setField('emergencyContact', event.target.value)} placeholder="Name, relationship, and phone number" /></label>
        </div>
      </fieldset>

      <fieldset disabled={isSubmitting}>
        <legend>Clinical registration</legend>
        <div className="form-grid form-grid--2">
          <label className="form-field form-field--full"><span>Reason for visit *</span><textarea required minLength={2} maxLength={1000} rows={2} value={form.reasonForVisit} onChange={(event) => setField('reasonForVisit', event.target.value)} placeholder="Primary complaint or reason for registration" /></label>
          <label className="form-field form-field--full"><span>Medical history</span><textarea maxLength={5000} rows={3} value={form.medicalHistory} onChange={(event) => setField('medicalHistory', event.target.value)} placeholder="Known conditions, allergies, surgeries, or current treatment" /></label>
        </div>
      </fieldset>

      <footer className="patient-form__actions">
        <button className="button" type="button" onClick={onCancel} disabled={isSubmitting}>Cancel</button>
        <button className="button button--primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? <><LoaderCircle className="spin" size={17} /> Saving…</> : <><Save size={17} /> {patient ? 'Save changes' : 'Register patient'}</>}
        </button>
      </footer>
    </form>
  );
};
