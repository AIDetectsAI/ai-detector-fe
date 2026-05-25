import { useState, useEffect } from 'react';
import { fetchHistory, type HistoryEntry } from '../lib/api';
import styles from './HistoryList.module.css';

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
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function HistoryList() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchHistory()
      .then(setHistory)
      .catch((e) => {
        const msg = e.message || '';
        if (msg.includes('Not authenticated')) {
          setError('You are not logged in. Please log in to view history.');
        } else if (msg.includes('User not found')) {
          setError('User account could not be found.');
        } else {
          setError('Failed to load history.');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const openModal = (entry: HistoryEntry) => {
    setSelectedEntry(entry);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedEntry(null);
    setModalOpen(false);
  };

  return (
    <div className={styles.historyPage}>
      <div className={styles.pageHeader}>
        <h1>Analysis History</h1>
        <p>Review your past image analyses</p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted-text)' }}>Loading history...</p>
      ) : error ? (
        <div className={styles.uploadError}>{error}</div>
      ) : history.length === 0 ? (
        <div className={styles.historyInfoBanner}>
          <svg
            width='16'
            height='16'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
          >
            <circle cx='12' cy='12' r='10' />
            <line x1='12' y1='16' x2='12' y2='12' />
            <line x1='12' y1='8' x2='12.01' y2='8' />
          </svg>
          <span>
            Brak wyników. Prześlij zdjęcie, aby zobaczyć tutaj analizy.
          </span>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((entry) => (
            <div key={entry.id} className={styles.historyCard}>
              <div
                className={styles.imageContainer}
                onClick={() => openModal(entry)}
                title='Click to enlarge'
              >
                <img
                  src={entry.photoUrl}
                  alt='Analyzed image'
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/assets/placeholder-image.png';
                  }}
                />
              </div>
              <div className={styles.cardContent}>
                <span className={styles.date}>
                  {formatDate(entry.createdAt)}
                </span>
                <span className={styles.model}>{entry.model}</span>
              </div>
              <div className={styles.resultBadge}>
                <span
                  className={styles.score}
                  style={{ color: getResultColor(entry.chance) }}
                >
                  {Math.round(entry.chance)}%
                </span>
                <span
                  className={styles.label}
                  style={{ color: getResultColor(entry.chance) }}
                >
                  {getResultLabel(entry.chance)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Overlay */}
      {modalOpen && selectedEntry && (
        <div className={styles.modalOverlay} onClick={closeModal}>
          <div
            className={styles.modalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <button onClick={closeModal} className={styles.closeButton}>
              ×
            </button>
            <img src={selectedEntry.photoUrl} alt='Large preview' />
            <div className={styles.modalResultInfo}>
              <span
                className={styles.modalScore}
                style={{ color: getResultColor(selectedEntry.chance) }}
              >
                {Math.round(selectedEntry.chance)}%
              </span>
              <span
                className={styles.modalLabel}
                style={{ color: getResultColor(selectedEntry.chance) }}
              >
                {getResultLabel(selectedEntry.chance)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
