// Keep this in sync with BOOKING_STATUSES exported from the backend's models/Booking.js.
// Anywhere in the UI that shows a booking's progress should read from this file,
// not hardcode status strings.

export const BOOKING_STEPS = [
  { key: 'pending', label: 'Requested' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'paid', label: 'Paid' },
  { key: 'active', label: 'In use' },
  { key: 'returned', label: 'Returned' },
  { key: 'settled', label: 'Settled' },
];

export const STATUS_META = {
  pending: { label: 'Pending', tone: 'ink' },
  confirmed: { label: 'Confirmed', tone: 'ink' },
  paid: { label: 'Paid', tone: 'brass' },
  active: { label: 'In use', tone: 'brass' },
  returned: { label: 'Returned', tone: 'brass' },
  settled: { label: 'Settled', tone: 'teal' },
  disputed: { label: 'Disputed', tone: 'rust' },
  cancelled: { label: 'Cancelled', tone: 'rust' },
  pending_listing: { label: 'Pending review', tone: 'brass' },
  approved: { label: 'Approved', tone: 'teal' },
  rejected: { label: 'Rejected', tone: 'rust' },
};
