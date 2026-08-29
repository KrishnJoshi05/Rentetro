export default function RatingStars({ rating = 0, count = 0 }) {
  const rounded = Math.round(rating);
  return (
    <span style={{ fontSize: 13, color: 'var(--ink-500)' }}>
      <span style={{ color: 'var(--brass-500)' }} aria-hidden="true">
        {'★'.repeat(rounded)}
        {'☆'.repeat(5 - rounded)}
      </span>{' '}
      {rating ? rating.toFixed(1) : 'No ratings yet'} {count ? `(${count})` : ''}
    </span>
  );
}
