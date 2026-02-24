import "./SkeletonCard.css";

export function SkeletonRanchCard() {
  return (
    <div className="skeleton-card skeleton-ranch-card" aria-hidden="true">
      <div className="skeleton-header">
        <div>
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--subtitle" />
        </div>
        <div className="skeleton-circle skeleton-circle--sm" />
      </div>
      <div className="skeleton-body">
        {[1, 2, 3].map((i) => (
          <div key={i} className="skeleton-row">
            <div className="skeleton-circle skeleton-circle--xs" />
            <div className="skeleton-line skeleton-line--medium" />
          </div>
        ))}
      </div>
      <div className="skeleton-footer">
        <div className="skeleton-line skeleton-line--short" />
        <div className="skeleton-line skeleton-line--short" />
      </div>
    </div>
  );
}

export function SkeletonSectorCard() {
  return (
    <div className="skeleton-card skeleton-sector-card" aria-hidden="true">
      <div className="skeleton-header">
        <div>
          <div className="skeleton-line skeleton-line--title" />
          <div className="skeleton-line skeleton-line--badge" />
        </div>
      </div>
      <div className="skeleton-metrics">
        <div className="skeleton-metric-grid">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="skeleton-metric-item">
              <div className="skeleton-circle skeleton-circle--md" />
              <div>
                <div className="skeleton-line skeleton-line--short" />
                <div className="skeleton-line skeleton-line--value" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function SkeletonGrid({ count = 3, type = "ranch" }) {
  const Card = type === "ranch" ? SkeletonRanchCard : SkeletonSectorCard;
  return (
    <>
      {Array.from({ length: count }, (_, i) => (
        <Card key={i} />
      ))}
    </>
  );
}
