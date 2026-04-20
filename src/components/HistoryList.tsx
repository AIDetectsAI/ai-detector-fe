import { useState, useEffect } from 'react';
import { fetchHistory, type HistoryEntry } from '../lib/api';

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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pl-PL', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  });
}

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory()
      .then(setHistory)
      .catch((e) => setError(e.message || 'Failed to load history'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="history-page">
      <div className="page-header">
        <h1>Analysis History</h1>
        <p>Review your past image analyses</p>
      </div>

      {error && <div className="upload-error">{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--muted-text)' }}>Loading history...</p>
      ) : history.length === 0 ? (
        <div className="history-info-banner">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <span>No analyses yet — upload an image to get started</span>
        </div>
      ) : (
      <div className="history-list">
        {history.map((entry) => (
          <div key={entry.id} className="history-card">
            <div className="history-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            </div>
            <div className="history-card-info">
              <span className="history-filename">{entry.photoId.slice(0, 8)}...</span>
              <span className="history-date">{formatDate(entry.createdAt)}</span>
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
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
}
