import { useState, useEffect, type FormEvent } from 'react';
import { getUsername, fetchCurrentUser, changePassword } from '../lib/api';
import { useTranslation } from 'react-i18next';
import '../locales/config';

export default function ProfileEditor() {
  const { t } = useTranslation();
  const [username, setUsername] = useState(getUsername());
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordMessage, setPasswordMessage] = useState('');

  useEffect(() => {
    fetchCurrentUser()
      .then((user) => {
        setUsername(user.login);
        setEmail(user.email);
      })
      .catch(() => setError(t('failed-to-load-profile')))
      .finally(() => setLoading(false));
  }, []);

  const handleProfileUpdate = (e: FormEvent) => {
    e.preventDefault();
    setMessage(t('profile-updated-successfully-mock'));
    setError('');
    setTimeout(() => setMessage(''), 3000);
  };

  const handlePasswordChange = (e: FormEvent) => {
    e.preventDefault();
    setPasswordMessage('');
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError(t('passwords-do-not-match'));
      return;
    }

    setChangingPassword(true);
    changePassword(currentPassword, newPassword)
      .then(() => {
        setPasswordMessage(t('password-changed-successfully'));
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch((err: any) => {
        const msg = err?.message || t('failed-to-change-password');
        if (msg.includes(t('invalid-current-password'))) {
          setPasswordError(t('incorrect-current-password'));
        } else if (msg.includes(t('password-change-is-only-available'))) {
          setPasswordError(
            t('password-change-is-not-available-for-oauth-accounts'),
          );
        } else if (
          msg.includes(t('invalid-data')) ||
          msg.includes(t('password-must'))
        ) {
          setPasswordError(t('password-is-too-weak'));
        } else {
          setPasswordError(msg);
        }
      })
      .finally(() => setChangingPassword(false));
  };

  const closePasswordPopup = () => {
    setPasswordError('');
    setPasswordMessage('');
  };

  return (
    <div className='profile-page'>
      <div className='page-header'>
        <h1>{t('profile')}</h1>
        <p>{t('manage-your-account-information')}</p>
      </div>

      {message && <div className='auth-success'>{message}</div>}
      {error && <div className='auth-error'>{error}</div>}

      {loading ? (
        <p style={{ color: 'var(--muted-text)' }}>{t('loading-profile')}</p>
      ) : (
        <div className='profile-sections'>
          <div className='profile-section'>
            <div className='profile-avatar-section'>
              <div className='profile-avatar'>
                <svg
                  width='48'
                  height='48'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='1.5'
                >
                  <path d='M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2' />
                  <circle cx='12' cy='7' r='4' />
                </svg>
              </div>
              <div className='profile-avatar-info'>
                <h2>{username}</h2>
                <p>{email}</p>
              </div>
            </div>
          </div>

          <div className='profile-section'>
            <h2>{t('personal-information')}</h2>
            <form onSubmit={handleProfileUpdate} className='profile-form'>
              <div className='form-group'>
                <label htmlFor='username'>{t('username')}</label>
                <input
                  id='username'
                  type='text'
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='prof-email'>{t('email')}</label>
                <input
                  id='prof-email'
                  type='email'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <button type='submit' className='btn-primary'>
                {t('save-changes')} </button>
            </form>
          </div>

          <div className='profile-section'>
            <h2>{t('change-password')}</h2>
            <form onSubmit={handlePasswordChange} className='profile-form'>
              <div className='form-group'>
                <label htmlFor='currentPassword'>{t('current-password')}</label>
                <input
                  id='currentPassword'
                  type='password'
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className='form-group'>
                <label htmlFor='newPassword'>{t('new-password')}</label>
                <input
                  id='newPassword'
                  type='password'
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                />
              </div>
              <div className='form-group'>
                <label htmlFor='confirmNewPassword'>{t('confirm-new-password')}</label>
                <input
                  id='confirmNewPassword'
                  type='password'
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type='submit'
                className='btn-primary'
                disabled={changingPassword}
              >
                {changingPassword ? t('changing') : t('change-password')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password change result popup */}
      {(passwordError || passwordMessage) && (
        <div className='popup-overlay' onClick={closePasswordPopup}>
          <div className='popup-content' onClick={(e) => e.stopPropagation()}>
            {passwordError && (
              <>
                <div className='popup-icon popup-icon-error'>
                  <svg
                    width='32'
                    height='32'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <circle cx='12' cy='12' r='10' />
                    <line x1='15' y1='9' x2='9' y2='15' />
                    <line x1='9' y1='9' x2='15' y2='15' />
                  </svg>
                </div>
                <p className='popup-message popup-message-error'>
                  {passwordError}
                </p>
              </>
            )}
            {passwordMessage && (
              <>
                <div className='popup-icon popup-icon-success'>
                  <svg
                    width='32'
                    height='32'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                  >
                    <circle cx='12' cy='12' r='10' />
                    <polyline points='16 10 11 15 8 12' />
                  </svg>
                </div>
                <p className='popup-message popup-message-success'>
                  {passwordMessage}
                </p>
              </>
            )}
            <button className='btn-primary' onClick={closePasswordPopup}>
              {t('ok')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
