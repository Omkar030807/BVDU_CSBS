import { HeartPulse } from 'lucide-react';

interface BrandProps {
  compact?: boolean;
  light?: boolean;
}

export const Brand = ({ compact = false, light = false }: BrandProps) => (
  <div className={`brand${light ? ' brand--light' : ''}`} aria-label="MediCore HMS">
    <span className="brand__mark" aria-hidden="true">
      <HeartPulse size={24} strokeWidth={2.2} />
    </span>
    {!compact && (
      <span className="brand__copy">
        <strong>MediCore</strong>
        <small>Hospital Management</small>
      </span>
    )}
  </div>
);
