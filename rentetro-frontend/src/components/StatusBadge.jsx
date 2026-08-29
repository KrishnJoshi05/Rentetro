import { STATUS_META } from '../constants/bookingStatus';

const TONE_STYLES = {
  ink: { background: 'var(--ink-100)', color: 'var(--ink-700)' },
  brass: { background: 'var(--brass-100)', color: 'var(--brass-600)' },
  teal: { background: 'var(--teal-100)', color: 'var(--teal-600)' },
  rust: { background: 'var(--rust-100)', color: 'var(--rust-600)' },
};

export default function StatusBadge({ status }) {
  const meta = STATUS_META[status] || { label: status, tone: 'ink' };
  const style = TONE_STYLES[meta.tone];

  return (
    <span
      style={{
        ...style,
        display: 'inline-block',
        fontSize: 12,
        fontWeight: 600,
        padding: '3px 10px',
        borderRadius: 999,
        letterSpacing: '0.02em',
        textTransform: 'uppercase',
      }}
    >
      {meta.label}
    </span>
  );
}
