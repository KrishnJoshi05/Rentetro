import { BOOKING_STEPS } from '../constants/bookingStatus';

export default function BookingStepper({ status }) {
  if (status === 'disputed' || status === 'cancelled') {
    return (
      <div style={{ color: 'var(--rust-600)', fontWeight: 600, fontSize: 13 }}>
        {status === 'disputed' ? 'This booking is under dispute review' : 'This booking was cancelled'}
      </div>
    );
  }

  const currentIndex = BOOKING_STEPS.findIndex((s) => s.key === status);

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {BOOKING_STEPS.map((step, i) => {
        const reached = i <= currentIndex;
        return (
          <div key={step.key} style={{ display: 'flex', alignItems: 'center', flex: i < BOOKING_STEPS.length - 1 ? 1 : 'initial' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: '50%',
                  background: reached ? 'var(--brass-500)' : 'var(--ink-100)',
                  border: reached ? '1px solid var(--brass-600)' : '1px solid var(--ink-100)',
                }}
                aria-hidden="true"
              />
              <span style={{ fontSize: 11, color: reached ? 'var(--ink-900)' : 'var(--ink-500)', whiteSpace: 'nowrap' }}>
                {step.label}
              </span>
            </div>
            {i < BOOKING_STEPS.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 2,
                  background: i < currentIndex ? 'var(--brass-500)' : 'var(--ink-100)',
                  margin: '0 6px 18px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
