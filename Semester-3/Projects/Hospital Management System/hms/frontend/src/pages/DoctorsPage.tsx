import {
  AlertCircle,
  BadgeIndianRupee,
  Building2,
  CalendarClock,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  FilterX,
  LoaderCircle,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Stethoscope,
  Trash2,
  UsersRound,
} from 'lucide-react';
import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { DoctorForm } from '../components/DoctorForm';
import { Modal } from '../components/Modal';
import {
  createDoctorRequest,
  deleteDoctorRequest,
  listDoctorsRequest,
  updateDoctorRequest,
} from '../services/doctorApi';
import {
  DAYS_OF_WEEK,
  type DayOfWeek,
  type Doctor,
  type DoctorListResponse,
  type DoctorPayload,
} from '../types/doctor';

interface ToastState { type: 'success' | 'error'; message: string; }

const currency = new Intl.NumberFormat('en-IN', {
  style: 'currency', currency: 'INR', maximumFractionDigits: 2,
});

export const DoctorsPage = () => {
  const navigate = useNavigate();
  const [result, setResult] = useState<DoctorListResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [department, setDepartment] = useState('');
  const [availableDay, setAvailableDay] = useState<DayOfWeek | ''>('');
  const [minFee, setMinFee] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [page, setPage] = useState(1);
  const [formMode, setFormMode] = useState<'create' | 'edit' | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [detailsDoctor, setDetailsDoctor] = useState<Doctor | null>(null);
  const [deleteDoctor, setDeleteDoctor] = useState<Doctor | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const loadDoctors = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    try {
      const data = await listDoctorsRequest({
        ...(search ? { search } : {}),
        ...(specialization ? { specialization } : {}),
        ...(department ? { department } : {}),
        ...(availableDay ? { availableDay } : {}),
        ...(minFee ? { minFee: Number(minFee) } : {}),
        ...(maxFee ? { maxFee: Number(maxFee) } : {}),
        page,
        limit: 10,
      });
      setResult(data);
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Unable to load doctors.');
    } finally {
      setIsLoading(false);
    }
  }, [search, specialization, department, availableDay, minFee, maxFee, page]);

  useEffect(() => { void loadDoctors(); }, [loadDoctors]);
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
    setSpecialization('');
    setDepartment('');
    setAvailableDay('');
    setMinFee('');
    setMaxFee('');
    setPage(1);
  };

  const openCreate = (): void => {
    setSelectedDoctor(null);
    setFormError(null);
    setFormMode('create');
  };

  const openEdit = (doctor: Doctor): void => {
    setSelectedDoctor(doctor);
    setFormError(null);
    setFormMode('edit');
  };

  const saveDoctor = async (payload: DoctorPayload): Promise<void> => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      if (formMode === 'edit' && selectedDoctor) {
        await updateDoctorRequest(selectedDoctor.id, payload);
        setToast({ type: 'success', message: 'Doctor profile updated successfully.' });
      } else {
        await createDoctorRequest(payload);
        setToast({ type: 'success', message: 'Doctor added successfully.' });
      }
      setFormMode(null);
      setSelectedDoctor(null);
      setPage(1);
      await loadDoctors();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save doctor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!deleteDoctor) return;
    setIsSubmitting(true);
    try {
      await deleteDoctorRequest(deleteDoctor.id);
      setDeleteDoctor(null);
      setToast({ type: 'success', message: `${deleteDoctor.name}'s profile was removed.` });
      await loadDoctors();
    } catch (error) {
      setToast({ type: 'error', message: error instanceof Error ? error.message : 'Unable to delete doctor.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasFilters = Boolean(search || specialization || department || availableDay || minFee || maxFee);
  const doctors = result?.doctors ?? [];

  return (
    <div className="dashboard-page doctors-page">
      <section className="page-heading doctors-heading">
        <div><p className="eyebrow">Clinical workforce</p><h2>Doctor management</h2><p>Maintain professional profiles, fees, rooms, and weekly availability.</p></div>
        <button className="button button--primary" onClick={openCreate}><Plus size={17} /> Add doctor</button>
      </section>

      <section className="doctor-summary patient-summary">
        <article><span><Stethoscope size={21} /></span><div><strong>{result?.pagination.total ?? '—'}</strong><small>{hasFilters ? 'Matching doctors' : 'Active doctors'}</small></div></article>
        <article><span><Building2 size={21} /></span><div><strong>{result?.filterOptions.departments.length ?? '—'}</strong><small>Active departments</small></div></article>
        <article><span><CalendarClock size={21} /></span><div><strong>Structured</strong><small>Weekly availability</small></div></article>
      </section>

      <section className="panel doctor-directory patient-directory">
        <div className="patient-toolbar">
          <form className="patient-search" onSubmit={applySearch}>
            <Search size={17} />
            <input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search name, doctor ID, specialty, email, phone, or room" aria-label="Search doctors" />
            <button type="submit">Search</button>
          </form>
          <div className="patient-filters doctor-filters">
            <select aria-label="Filter by specialization" value={specialization} onChange={(event) => { setSpecialization(event.target.value); setPage(1); }}><option value="">All specializations</option>{result?.filterOptions.specializations.map((item) => <option key={item}>{item}</option>)}</select>
            <select aria-label="Filter by department" value={department} onChange={(event) => { setDepartment(event.target.value); setPage(1); }}><option value="">All departments</option>{result?.filterOptions.departments.map((item) => <option key={item}>{item}</option>)}</select>
            <select aria-label="Filter by available day" value={availableDay} onChange={(event) => { setAvailableDay(event.target.value as DayOfWeek | ''); setPage(1); }}><option value="">Any day</option>{DAYS_OF_WEEK.map((day) => <option key={day}>{day}</option>)}</select>
            <input type="number" min="0" value={minFee} onChange={(event) => { setMinFee(event.target.value); setPage(1); }} placeholder="Min ₹" aria-label="Minimum fee" />
            <input type="number" min="0" value={maxFee} onChange={(event) => { setMaxFee(event.target.value); setPage(1); }} placeholder="Max ₹" aria-label="Maximum fee" />
            {hasFilters && <button className="icon-button icon-button--bordered" onClick={clearFilters} aria-label="Clear filters"><FilterX size={16} /></button>}
          </div>
        </div>

        {loadError ? (
          <div className="table-state table-state--error"><AlertCircle size={28} /><strong>Doctor profiles could not be loaded</strong><p>{loadError}</p><button className="button button--small" onClick={() => void loadDoctors()}><RefreshCw size={15} /> Retry</button></div>
        ) : isLoading ? (
          <div className="table-state"><LoaderCircle className="spin" size={28} /><strong>Loading doctor profiles…</strong></div>
        ) : doctors.length === 0 ? (
          <div className="table-state doctor-empty"><UsersRound size={30} /><strong>{hasFilters ? 'No doctors match these filters' : 'No active doctors added'}</strong><p>{hasFilters ? 'Try a broader search or clear the current filters.' : 'Add the first doctor to create the clinical workforce directory.'}</p>{hasFilters ? <button className="button button--small" onClick={clearFilters}><FilterX size={15} /> Clear filters</button> : <button className="button button--primary button--small" onClick={openCreate}><Plus size={15} /> Add doctor</button>}</div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="doctors-table patients-table">
                <thead><tr><th>Doctor</th><th>Specialization</th><th>Contact</th><th>Room</th><th>Fee</th><th>Availability</th><th><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{doctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td><button className="patient-identity doctor-identity" onClick={() => setDetailsDoctor(doctor)}><span><Stethoscope size={17} /></span><div><strong>{doctor.name}</strong><small>{doctor.doctorId}</small></div></button></td>
                    <td><strong className="table-primary">{doctor.specialization}</strong><small className="table-secondary">{doctor.department}</small></td>
                    <td><strong className="table-primary">{doctor.phone}</strong><small className="table-secondary">{doctor.email}</small></td>
                    <td><span className="room-badge">{doctor.room}</span></td>
                    <td><strong className="fee-text">{currency.format(doctor.consultationFee)}</strong></td>
                    <td><div className="availability-compact">{doctor.availability.length ? <><strong>{doctor.availability.length} days</strong><small>{doctor.availability.slice(0, 3).map((slot) => slot.day.slice(0, 3)).join(' · ')}{doctor.availability.length > 3 ? ' +' : ''}</small></> : <span>Unavailable</span>}</div></td>
                    <td><div className="row-actions"><button onClick={() => setDetailsDoctor(doctor)} aria-label={`View ${doctor.name}`} title="View"><Eye size={16} /></button><button onClick={() => openEdit(doctor)} aria-label={`Edit ${doctor.name}`} title="Edit"><Pencil size={15} /></button><button className="row-action--danger" onClick={() => setDeleteDoctor(doctor)} aria-label={`Delete ${doctor.name}`} title="Delete"><Trash2 size={15} /></button></div></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <footer className="table-pagination"><p>Showing <strong>{doctors.length}</strong> of <strong>{result?.pagination.total}</strong> doctors</p><div><button className="icon-button icon-button--bordered" disabled={page <= 1} onClick={() => setPage((current) => current - 1)} aria-label="Previous page"><ChevronLeft size={17} /></button><span>Page {page} of {Math.max(result?.pagination.totalPages ?? 1, 1)}</span><button className="icon-button icon-button--bordered" disabled={page >= (result?.pagination.totalPages ?? 1)} onClick={() => setPage((current) => current + 1)} aria-label="Next page"><ChevronRight size={17} /></button></div></footer>
          </>
        )}
      </section>

      {formMode && <Modal size="large" title={formMode === 'edit' ? 'Edit doctor profile' : 'Add doctor'} subtitle={formMode === 'edit' ? selectedDoctor?.doctorId : 'Create a professional hospital profile'} onClose={() => !isSubmitting && setFormMode(null)}><DoctorForm doctor={formMode === 'edit' ? selectedDoctor ?? undefined : undefined} isSubmitting={isSubmitting} error={formError} onSubmit={saveDoctor} onCancel={() => setFormMode(null)} /></Modal>}

      {detailsDoctor && <Modal size="medium" title={detailsDoctor.name} subtitle={`${detailsDoctor.doctorId} · ${detailsDoctor.specialization}`} onClose={() => setDetailsDoctor(null)}><div className="doctor-details patient-details"><div className="doctor-details__hero patient-details__hero"><span><Stethoscope size={25} /></span><div><strong>{detailsDoctor.department}</strong><small>Room {detailsDoctor.room} · {currency.format(detailsDoctor.consultationFee)}</small></div><button className="button button--small" onClick={() => { setDetailsDoctor(null); openEdit(detailsDoctor); }}><Pencil size={14} /> Edit</button></div><div className="detail-grid"><div><span><Phone size={15} /> Phone</span><strong>{detailsDoctor.phone}</strong></div><div><span><Mail size={15} /> Email</span><strong>{detailsDoctor.email}</strong></div><div><span><MapPin size={15} /> Room</span><strong>{detailsDoctor.room}</strong></div><div><span><BadgeIndianRupee size={15} /> Consultation fee</span><strong>{currency.format(detailsDoctor.consultationFee)}</strong></div></div><section><h3>Weekly availability</h3>{detailsDoctor.availability.length ? <div className="schedule-list">{detailsDoctor.availability.map((slot) => <div key={slot.day}><strong>{slot.day}</strong><span><Clock3 size={13} /> {slot.startTime} – {slot.endTime}</span></div>)}</div> : <p>No regular availability configured.</p>}</section><section className="appointments-pending"><span><CalendarDays size={20} /></span><div><h3>Appointments</h3><p>Open the live appointment directory filtered to this doctor.</p><button className="button button--small" onClick={() => { setDetailsDoctor(null); navigate(`/appointments?doctorId=${detailsDoctor.id}`); }}><CalendarDays size={14} /> View appointments</button></div></section></div></Modal>}

      {deleteDoctor && <Modal size="small" title="Delete doctor profile?" onClose={() => !isSubmitting && setDeleteDoctor(null)}><div className="delete-confirm"><span><Trash2 size={23} /></span><p><strong>{deleteDoctor.name}</strong> ({deleteDoctor.doctorId}) will be removed from active doctor records. The database retains an audit marker.</p><div><button className="button" onClick={() => setDeleteDoctor(null)} disabled={isSubmitting}>Cancel</button><button className="button button--danger" onClick={() => void confirmDelete()} disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="spin" size={16} /> : <Trash2 size={16} />} Delete profile</button></div></div></Modal>}

      {toast && <div className={`toast toast--${toast.type}`} role="status"><span>{toast.type === 'success' ? '✓' : '!'}</span>{toast.message}</div>}
    </div>
  );
};
