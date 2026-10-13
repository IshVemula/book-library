export function Stars({ rating }: { rating: number | null }) {
  if (!rating) return null;
  return (
    <span className="stars" aria-label={`${rating} out of 5 stars`} title={`${rating}/5`}>
      {"★".repeat(rating)}
      <span className="stars-empty">{"★".repeat(5 - rating)}</span>
    </span>
  );
}
