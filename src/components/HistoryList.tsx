import { useState, useEffect } from 'react';
import {
  clearHistory,
  deleteHistoryEntry,
  fetchHistory,
  type HistoryEntry,
} from '../lib/api';
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
  const [clearing, setClearing] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<HistoryEntry | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

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

  const handleClearHistory = () => {
    setConfirmClearAll(true);
  };

  const performClearHistory = async () => {
    setError('');
    setConfirmClearAll(false);
    setClearing(true);
    try {
      await clearHistory();
      closeModal();
      setHistory([]);
    } catch (err: any) {
      setError(err?.message || 'Failed to clear history.');
    } finally {
      setClearing(false);
    }
  };

  const handleDeleteEntry = (entryId: string) => {
    const askBeforeDelete =
      localStorage.getItem('confirmHistoryDelete') !== 'false';
    if (askBeforeDelete) {
      setConfirmDeleteId(entryId);
    } else {
      performDeleteEntry(entryId);
    }
  };

  const performDeleteEntry = async (entryId: string) => {
    setError('');
    setConfirmDeleteId(null);
    try {
      await deleteHistoryEntry(entryId);
      setHistory((prev) => prev.filter((e) => e.id !== entryId));
    } catch (err: any) {
      setError(err?.message || 'Failed to delete entry.');
    }
  };

  return (
    <div className={styles.historyPage}>
      <div className={styles.headerRow}>
        <div className={styles.pageHeader}>
          <h1>Analysis History</h1>
          <p>Review your past image analyses</p>
        </div>

        {!loading && !error && history.length > 0 && (
          <div className={styles.headerActions}>
            <button
              className='btn-danger'
              onClick={handleClearHistory}
              disabled={clearing}
            >
              <svg
                width='16'
                height='16'
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                style={{ marginRight: '6px', verticalAlign: 'middle' }}
              >
                <polyline points='3 6 5 6 21 6' />
                <path d='M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' />
                <line x1='10' y1='11' x2='10' y2='17' />
                <line x1='14' y1='11' x2='14' y2='17' />
              </svg>
              {clearing ? 'Clearing...' : 'Clear history'}
            </button>
          </div>
        )}
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
              <button
                className={styles.deleteEntryBtn}
                onClick={() => handleDeleteEntry(entry.id)}
                title='Delete entry'
              >
                ×
              </button>
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

      {/* Delete single entry confirmation popup */}
      {confirmDeleteId && (
        <div
          className={styles.modalOverlay}
          onClick={() => setConfirmDeleteId(null)}
        >
          <div
            className={styles.confirmDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <p>Are you sure you want to delete this entry?</p>
            <div className={styles.confirmActions}>
              <button
                className='btn-danger'
                onClick={() => performDeleteEntry(confirmDeleteId)}
              >
                Delete
              </button>
              <button
                className='btn-secondary'
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear all history confirmation popup */}
      {confirmClearAll && (
        <div
          className={styles.modalOverlay}
          onClick={() => setConfirmClearAll(false)}
        >
          <div
            className={styles.confirmDialog}
            onClick={(e) => e.stopPropagation()}
          >
            <p>
              Are you sure you want to clear all history? This cannot be undone.
            </p>
            <div className={styles.confirmActions}>
              <button className='btn-danger' onClick={performClearHistory}>
                Clear all
              </button>
              <button
                className='btn-secondary'
                onClick={() => setConfirmClearAll(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
