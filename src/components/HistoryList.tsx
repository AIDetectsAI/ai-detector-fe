import { useState, useEffect } from 'react';
import {
  clearHistory,
  deleteHistoryEntry,
  fetchHistory,
  type HistoryEntry,
} from '../lib/api';
import styles from './HistoryList.module.css';
import { useTranslation } from 'react-i18next';
import '../locales/config';
import type { TFunction } from 'i18next';

function getResultColor(chance: number): string {
  if (chance >= 70) return '#ef4444';
  if (chance >= 40) return '#f59e0b';
  return '#22c55e';
}

function getResultLabel(chance: number, t: TFunction): string {
  if (chance >= 70) return t('likely-ai');
  if (chance >= 40) return t('uncertain');
  return t('likely-real');
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
  const { t } = useTranslation();
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
        if (msg.includes(t('not-authenticated'))) {
          setError(t('you-are-not-logged-in-please-log-in-to-view-history'));
        } else if (msg.includes(t('user-not-found'))) {
          setError(t('user-account-could-not-be-found'));
        } else {
          setError(t('failed-to-load-history'));
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
      setError(err?.message || t('failed-to-clear-history'));
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
      setError(err?.message || t('failed-to-delete-entry'));
    }
  };

  return (
    <div className={styles.historyPage}>
      <div className={styles.headerRow}>
        <div className={styles.pageHeader}>
          <h1>{t('analysis-history')}</h1>
          <p>{t('review-your-past-image-analyses')}</p>
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
              {clearing ? 'Clearing...' : t('clear-history')}
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <p style={{ color: 'var(--muted-text)' }}>{t('loading-history')}</p>
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
            {t('no-results-upload-an-image-to-see-analysis-here')} </span>
        </div>
      ) : (
        <div className={styles.historyList}>
          {history.map((entry) => (
            <div key={entry.id} className={styles.historyCard}>
              <div
                className={styles.imageContainer}
                onClick={() => openModal(entry)}
                title={t('click-to-enlarge')}
              >
                <img
                  src={entry.photoUrl}
                  alt={t('analyzed-image')}
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src =
                      '/assets/placeholder-image.png';
                  }}
                />
              </div>
              <div className={styles.cardContent}>
                <span className={styles.date}>
                  {formatDate(entry.createdAt)}
                  <br />
                  {entry.caption}     
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
                  {getResultLabel(entry.chance, t)}
                </span>
              </div>
              <button
                className={styles.deleteEntryBtn}
                onClick={() => handleDeleteEntry(entry.id)}
                title={t('delete-entry')}
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
                {getResultLabel(selectedEntry.chance, t)}
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
            <p>{t('are-you-sure-you-want-to-delete-this-entry')}</p>
            <div className={styles.confirmActions}>
              <button
                className='btn-danger'
                onClick={() => performDeleteEntry(confirmDeleteId)}
              >
                {t('delete')} </button>
              <button
                className='btn-secondary'
                onClick={() => setConfirmDeleteId(null)}
              >
                {t('cancel')} </button>
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
              {t('are-you-sure-you-want-to-clear-all-history-this-cannot-be-undone')} </p>
            <div className={styles.confirmActions}>
              <button className='btn-danger' onClick={performClearHistory}>
                {t('clear-all')} </button>
              <button
                className='btn-secondary'
                onClick={() => setConfirmClearAll(false)}
              >
                {t('cancel')} </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
