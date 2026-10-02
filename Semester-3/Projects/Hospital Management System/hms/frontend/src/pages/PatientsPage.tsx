import {
  AlertCircle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  FilterX,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Modal } from '../components/Modal';
import { PatientForm } from '../components/PatientForm';
import {
  createPatientRequest,
  deletePatientRequest,
  listPatientsRequest,
  updatePatientRequest,
} from '../services/patientApi';
import {
  BLOOD_GROUPS,
  PATIENT_GENDERS,
  type BloodGroup,
  type Patient,
  type PatientGender,
  type PatientListResponse,
  type PatientPayload,
} from '../types/patient';

interface ToastState { type: 'success' | 'error'; message: string; }

const formatDate = (value: string): string =>
  new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export const PatientsPage = () => {
  const [result, setResult] = useState<PatientListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [gender, setGender] = useState<PatientGender | ''>('');
  const [bloodGroup, setBloodGroup] = useState<BloodGroup | ''>('');
  const [minAge, setMinAge] = useState('');
  const [maxAge, setMaxAge] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [detailsPatient, setDetailsPatient] = useState<Patient | null>(null);
  const [deletePatient, setDeletePatient] = useState<Patient | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const loadPatients = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await listPatientsRequest({
        ...(search ? { search } : {}),
        ...(gender ? { gender } : {}),
        ...(bloodGroup ? { bloodGroup } : {}),
        ...(minAge ? { minAge: Number(minAge) } : {}),
        ...(maxAge ? { maxAge: Number(maxAge) } : {}),
        page,
        limit: 10,
      });
      setResult(data);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load patients.');
    } finally {
      setIsLoading(false);
    }
  }, [search, gender, bloodGroup, minAge, maxAge, page]);

  useEffect(() => { void loadPatients(); }, [loadPatients]);
  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3_500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const applySearch = (event: FormEvent): void => {
    event.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearFilters = (): void => {
    setSearchInput('');
    setSearch('');
    setGender('');
    setBloodGroup('');
    setMinAge('');
    setMaxAge('');
    setPage(1);
  };

  const openCreate = (): void => {
    setSelectedPatient(null);
    setFormError(null);
    setFormMode('create');
  };

  const openEdit = (patient: Patient): void => {
    setSelectedPatient(patient);
    setFormError(null);
    setFormMode('edit');
  };

  const savePatient = async (payload: PatientPayload): Promise<void> => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (formMode === 'edit' && selectedPatient) {
        await updatePatientRequest(selectedPatient.id, payload);
        setToast({ type: 'success', message: 'Patient record updated successfully.' });
      } else {
        await createPatientRequest(payload);
        setToast({ type: 'success', message: 'Patient registered successfully.' });
      }
      setFormMode(null);
      setSelectedPatient(null);
      setPage(1);
      await loadPatients();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save patient.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deletePatient) return;
    setIsSubmitting(true);
    try {
      await deletePatientRequest(deletePatient.id);
      setDeletePatient(null);
      setToast({ type: 'success', message: `${deletePatient.fullName}'s record was removed.` });
      await loadPatients();
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to delete patient.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasFilters = Boolean(search || gender || bloodGroup || minAge || maxAge);
  const patients = result?.patients ?? [];

  return (
    <div className="dashboard-page patients-page">
      <section className="page-heading patients-heading">
        <div><p className="eyebrow">Clinical registry</p><h2>Patient management</h2><p>Register, find, review, and maintain patient records securely.</p></div>
        <button className="button button--primary" onClick={openCreate}><Plus size={17} /> Register patient</button>
      </section>

      <section className="patient-summary">
        <article><span><UsersRound size={21} /></span><div><strong>{result?.pagination.total ?? '—'}</strong><small>{hasFilters ? 'Matching patients' : 'Active patients'}</small></div></article>
        <article><span><FileText size={21} /></span><div><strong>Database</strong><small>All records are persisted</small></div></article>
        <article><span><CalendarDays size={21} /></span><div><strong>Live age</strong><small>Calculated from date of birth</small></div></article>
      </section>

      <section className="panel patient-directory">
        <div className="patient-toolbar">
          <form className="patient-search" onSubmit={applySearch}>
            <Search size={17} />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, patient ID, phone, email, or visit reason" aria-label="Search patients" />
            <button type="submit">Search</button>
          </form>
          <div className="patient-filters">
            <select aria-label="Filter by gender" value={gender} onChange={(event) => { setGender(event.target.value as PatientGender | ''); setPage(1); }}><option value="">All genders</option>{PATIENT_GENDERS.map((item) => <option key={item}>{item}</option>)}</select>
            <select aria-label="Filter by blood group" value={bloodGroup} onChange={(event) => { setBloodGroup(event.target.value as BloodGroup | ''); setPage(1); }}><option value="">All blood groups</option>{BLOOD_GROUPS.map((item) => <option key={item}>{item}</option>)}</select>
            <input type="number" min="0" max="130" value={minAge} onChange={(event) => { setMinAge(event.target.value); setPage(1); }} placeholder="Min age" aria-label="Minimum age" />
            <input type="number" min="0" max="130" value={maxAge} onChange={(event) => { setMaxAge(event.target.value); setPage(1); }} placeholder="Max age" aria-label="Maximum age" />
            {hasFilters && <button className="icon-button icon-button--bordered" onClick={clearFilters} aria-label="Clear filters" title="Clear filters"><FilterX size={16} /></button>}
          </div>
        </div>

        {loadError ? (
          <div className="table-state table-state--error"><AlertCircle size={28} /><strong>Patient records could not be loaded</strong><p>{loadError}</p><button className="button button--small" onClick={() => void loadPatients()}><RefreshCw size={15} /> Retry</button></div>
        ) : isLoading ? (
          <div className="table-state"><LoaderCircle className="spin" size={28} /><strong>Loading patient records…</strong></div>
        ) : patients.length === 0 ? (
          <div className="table-state patient-empty"><UsersRound size={30} /><strong>{hasFilters ? 'No patients match these filters' : 'No active patients registered'}</strong><p>{hasFilters ? 'Try a broader search or clear the current filters.' : 'Register the first patient to begin the clinical directory.'}</p>{hasFilters ? <button className="button button--small" onClick={clearFilters}><FilterX size={15} /> Clear filters</button> : <button className="button button--primary button--small" onClick={openCreate}><Plus size={15} /> Register patient</button>}</div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="patients-table">
                <thead><tr><th>Patient</th><th>Demographics</th><th>Contact</th><th>Reason for visit</th><th>Registered</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{patients.map((patient) => (
                  <tr key={patient.id}>
                    <td><button className="patient-identity" onClick={() => setDetailsPatient(patient)}><span>{patient.fullName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase()}</span><div><strong>{patient.fullName}</strong><small>{patient.patientId}</small></div></button></td>
                    <td><strong className="table-primary">{patient.age} years · {patient.gender}</strong><small className="table-secondary"><i>{patient.bloodGroup}</i> DOB {formatDate(patient.dateOfBirth)}</small></td>
                    <td><strong className="table-primary">{patient.phone}</strong><small className="table-secondary">{patient.email ?? 'No email provided'}</small></td>
                    <td><span className="reason-text">{patient.reasonForVisit}</span></td>
                    <td><strong className="table-primary">{formatDate(patient.registrationDate)}</strong></td>
                    <td><div className="row-actions"><button onClick={() => setDetailsPatient(patient)} aria-label={`View ${patient.fullName}`} title="View"><Eye size={16} /></button><button onClick={() => openEdit(patient)} aria-label={`Edit ${patient.fullName}`} title="Edit"><Pencil size={15} /></button><button className="row-action--danger" onClick={() => setDeletePatient(patient)} aria-label={`Delete ${patient.fullName}`} title="Delete"><Trash2 size={15} /></button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <footer className="table-pagination">
              <p>Showing <strong>{patients.length}</strong> of <strong>{result?.pagination.total}</strong> patients</p>
              <div><button className="icon-button icon-button--bordered" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page"><ChevronLeft size={17} /></button><span>Page {page} of {Math.max(result?.pagination.totalPages ?? 1, 1)}</span><button className="icon-button icon-button--bordered" disabled={page >= (result?.pagination.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={17} /></button></div>
            </footer>
          </>
        )}
      </section>

      {formMode && <Modal size="large" title={formMode === 'edit' ? 'Edit patient record' : 'Register new patient'} subtitle={formMode === 'edit' ? selectedPatient?.patientId : 'Create a secure hospital patient record'} onClose={() => !isSubmitting && setFormMode(null)}><PatientForm patient={formMode === 'edit' ? selectedPatient ?? undefined : undefined} isSubmitting={isSubmitting} error={formError} onSubmit={savePatient} onCancel={() => setFormMode(null)} /></Modal>}

      {detailsPatient && <Modal size="medium" title={detailsPatient.fullName} subtitle={`${detailsPatient.patientId} · Registered ${formatDate(detailsPatient.registrationDate)}`} onClose={() => setDetailsPatient(null)}><div className="patient-details"><div className="patient-details__hero"><span><UserRound size={26} /></span><div><strong>{detailsPatient.age} years · {detailsPatient.gender}</strong><small>Blood group {detailsPatient.bloodGroup}</small></div><button className="button button--small" onClick={() => { setDetailsPatient(null); openEdit(detailsPatient); }}><Pencil size={14} /> Edit</button></div><div className="detail-grid"><div><span><CalendarDays size={15} /> Date of birth</span><strong>{formatDate(detailsPatient.dateOfBirth)}</strong></div><div><span><Phone size={15} /> Phone</span><strong>{detailsPatient.phone}</strong></div><div><span><Mail size={15} /> Email</span><strong>{detailsPatient.email ?? 'Not provided'}</strong></div><div><span><MapPin size={15} /> Address</span><strong>{detailsPatient.address}</strong></div></div><section><h3>Emergency contact</h3><p>{detailsPatient.emergencyContact}</p></section><section><h3>Reason for visit</h3><p>{detailsPatient.reasonForVisit}</p></section><section><h3>Medical history</h3><p>{detailsPatient.medicalHistory ?? 'No medical history recorded.'}</p></section></div></Modal>}

      {deletePatient && <Modal size="small" title="Delete patient record?" onClose={() => !isSubmitting && setDeletePatient(null)}><div className="delete-confirm"><span><Trash2 size={23} /></span><p><strong>{deletePatient.fullName}</strong> ({deletePatient.patientId}) will be removed from active patient records. The database retains an audit marker.</p><div><button className="button" onClick={() => setDeletePatient(null)} disabled={isSubmitting}>Cancel</button><button className="button button--danger" onClick={() => void confirmDelete()} disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />} Delete record</button></div></div></Modal>}

      {toast && <div className={`toast toast--${toast.type}`} role="status"><span>{toast.type === 'success' ? '✓' : '!'}</span>{toast.message}</div>}
    </div>
  );
};
