import { useState, useEffect } from 'react';
import { deleteAccount, removeAuth } from '../lib/api';
import { useTranslation } from 'react-i18next';
import '../locales/config';

export default function SettingsPanel() {
  const { t, i18n } = useTranslation();
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [confirmHistoryDelete, setConfirmHistoryDelete] = useState(true);
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setDarkMode(localStorage.getItem('darkMode') === 'true');
    setNotifications(localStorage.getItem('notifications') !== 'false');
    setAutoAnalyze(localStorage.getItem('autoAnalyze') === 'true');
    setConfirmHistoryDelete(
      localStorage.getItem('confirmHistoryDelete') !== 'false',
    );
  }, []);

  const handleDarkMode = (enabled: boolean) => {
    setDarkMode(enabled);
    localStorage.setItem('darkMode', enabled.toString());
    document.documentElement.classList.toggle('dark', enabled);
  };

  const handleAutoAnalyze = (enabled: boolean) => {
    setAutoAnalyze(enabled);
    localStorage.setItem('autoAnalyze', enabled.toString());
  };

  const handleNotifications = (enabled: boolean) => {
    setNotifications(enabled);
    localStorage.setItem('notifications', enabled.toString());
  };

  const handleConfirmHistoryDelete = (enabled: boolean) => {
    setConfirmHistoryDelete(enabled);
    localStorage.setItem('confirmHistoryDelete', enabled.toString());
  };

  const handleLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const handleDeleteAccount = async () => {
    setMessage('');
    setError('');

    const confirmed = window.confirm(
      t('are-you-sure-you-want-to-permanently-delete-your-account-and-all-data'),
    );
    if (!confirmed) return;

    setDeletingAccount(true);
    try {
      await deleteAccount();
      removeAuth();
      window.location.href = '/login';
    } catch (err: any) {
      setError(err?.message || t('failed-to-delete-account'));
    } finally {
      setDeletingAccount(false);
    }
  };

  return (
    <div className='settings-page'>
      <div className='page-header'>
        <h1>{t('settings')}</h1>
        <p>{t('customize-your-experience')}</p>
      </div>

      {message && <div className='auth-success'>{message}</div>}
      {error && <div className='auth-error'>{error}</div>}

      <div className='settings-sections'>
        <div className='settings-section'>
          <h2>{t('appearance')}</h2>
          <div className='setting-item'>
            <div className='setting-info'>
              <span className='setting-label'>{t('dark-mode')}</span>
              <span className='setting-desc'>
                {t('switch-between-light-and-dark-theme')} </span>
            </div>
            <label className='toggle'>
              <input
                type='checkbox'
                checked={darkMode}
                onChange={(e) => handleDarkMode(e.target.checked)}
              />
              <span className='toggle-slider' />
            </label>
          </div>
          <div className='setting-item'>
            <div className='setting-info'>
              <span className='setting-label'>{t('language')}</span>
              <span className='setting-desc'>
                {t('select-your-preferred-language')} </span>
            </div>
            <select
              value={i18n.resolvedLanguage}
              onChange={(e) => handleLanguage(e.target.value)}
              className='setting-select'
            >
              <option value='en'>{t('english')}</option>
              <option value='pl'>{t('polish')}</option>
            </select>
          </div>
        </div>

        <div className='settings-section'>
          <h2>{t('analysis')}</h2>
          <div className='setting-item'>
            <div className='setting-info'>
              <span className='setting-label'>{t('auto-analyze-on-upload')}</span>
              <span className='setting-desc'>
                {t('automatically-start-analysis-when-an-image-is-uploaded')} </span>
            </div>
            <label className='toggle'>
              <input
                type='checkbox'
                checked={autoAnalyze}
                onChange={(e) => handleAutoAnalyze(e.target.checked)}
              />
              <span className='toggle-slider' />
            </label>
          </div>
        </div>

        <div className='settings-section'>
          <h2>{t('history')}</h2>
          <div className='setting-item'>
            <div className='setting-info'>
              <span className='setting-label'>
                {t('ask-before-deleting-history-entries')} </span>
              <span className='setting-desc'>
                {t('show-a-confirmation-popup-before-deleting-individual-history-entries')} </span>
            </div>
            <label className='toggle'>
              <input
                type='checkbox'
                checked={confirmHistoryDelete}
                onChange={(e) => handleConfirmHistoryDelete(e.target.checked)}
              />
              <span className='toggle-slider' />
            </label>
          </div>
        </div>

        <div className='settings-section'>
          <h2>{t('notifications')}</h2>
          <div className='setting-item'>
            <div className='setting-info'>
              <span className='setting-label'>{t('email-notifications')}</span>
              <span className='setting-desc'>
                {t('receive-email-updates-about-your-analyses')} </span>
            </div>
            <label className='toggle'>
              <input
                type='checkbox'
                checked={notifications}
                onChange={(e) => handleNotifications(e.target.checked)}
              />
              <span className='toggle-slider' />
            </label>
          </div>
        </div>

        <div className='settings-section'>
          <h2>{t('danger-zone')}</h2>
          <div className='setting-item danger'>
            <div className='setting-info'>
              <span className='setting-label'>{t('delete-account')}</span>
              <span className='setting-desc'>
                {t('permanently-delete-your-account-and-all-data')} </span>
            </div>
            <button
              className='btn-danger'
              onClick={handleDeleteAccount}
              disabled={deletingAccount}
            >
              {deletingAccount ? t('deleting') : t('delete-account')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
