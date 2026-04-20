interface HistoryEntry {
  id: string;
  date: string;
  imageName: string;
  model: string;
  chance: number;
  processingTimeMs: number;
}

const mockHistory: HistoryEntry[] = [
  { id: '1', date: '2026-04-20 14:32', imageName: 'sunset_photo.jpg', model: 'ai-detector-v1', chance: 12.5, processingTimeMs: 234 },
  { id: '2', date: '2026-04-20 13:15', imageName: 'portrait_01.png', model: 'ai-detector-v1', chance: 87.3, processingTimeMs: 189 },
  { id: '3', date: '2026-04-19 22:45', imageName: 'landscape.webp', model: 'ai-detector-v1', chance: 45.8, processingTimeMs: 312 },
  { id: '4', date: '2026-04-19 18:20', imageName: 'product_image.jpg', model: 'ai-detector-v1', chance: 92.1, processingTimeMs: 198 },
  { id: '5', date: '2026-04-18 10:05', imageName: 'cat_meme.png', model: 'ai-detector-v1', chance: 3.2, processingTimeMs: 156 },
  { id: '6', date: '2026-04-17 16:33', imageName: 'abstract_art.jpg', model: 'ai-detector-v1', chance: 78.9, processingTimeMs: 275 },
  { id: '7', date: '2026-04-17 09:12', imageName: 'selfie_001.jpg', model: 'ai-detector-v1', chance: 5.4, processingTimeMs: 142 },
  { id: '8', date: '2026-04-16 20:40', imageName: 'generated_face.png', model: 'ai-detector-v1', chance: 96.7, processingTimeMs: 201 },
];

function getResultColor(chance: number): string {
  if (chance >= 70) return '#ef4444';
  if (chance >= 40) return '#f59e0b';
  return '#22c55e';
}

function getResultLabel(chance: number): string {
  if (chance >= 70) return 'Likely AI';
  if (chance >= 40) return 'Uncertain';
  return 'Likely Real';
}

export default function HistoryList() {
  return (
    <div className="history-page">
      <div className="page-header">
        <h1>Analysis History</h1>
        <p>Review your past image analyses</p>
      </div>

      <div className="history-info-banner">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
        <span>Showing mocked data — history endpoint coming soon</span>
      </div>

      <div className="history-list">
        {mockHistory.map((entry) => (
          <div key={entry.id} className="history-card">
            <div className="history-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="history-card-info">
              <span className="history-filename">{entry.imageName}</span>
              <span className="history-date">{entry.date}</span>
            </div>
            <div className="history-card-result">
              <span className="history-chance" style={{ color: getResultColor(entry.chance) }}>
                {entry.chance}%
              </span>
              <span className="history-label" style={{ color: getResultColor(entry.chance) }}>
                {getResultLabel(entry.chance)}
              </span>
            </div>
            <div className="history-card-meta">
              <span>{entry.model}</span>
              <span>{entry.processingTimeMs}ms</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
