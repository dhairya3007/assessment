import type { Job } from '../lib/api';

export default function StatsCards({ job }: { job: Job }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-6)' }}>
      <div className="card text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 800 }}>{job.total_count}</div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Records</div>
      </div>
      <div className="card text-center" style={{ borderBottom: '4px solid var(--color-success)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 800 }}>{job.valid_count}</div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Valid</div>
      </div>
      <div className="card text-center" style={{ borderBottom: '4px solid var(--color-error)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 800 }}>{job.invalid_count}</div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invalid</div>
      </div>
      <div className="card text-center" style={{ borderBottom: '4px solid var(--color-warning)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: 800 }}>{job.duplicate_count}</div>
        <div style={{ color: 'var(--color-text-muted)', fontSize: '14px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duplicates</div>
      </div>
    </div>
  );
}
