import { useState, type FormEvent } from 'react';
import { registerUser, loginUser, setAuth } from '../lib/api';
import { useTranslation } from 'react-i18next';
import '../locales/config';

export default function RegisterForm() {
  const { t } = useTranslation();
  const [login, setLogin] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError(t('passwords-do-not-match'));
      return;
    }

    if (password.length < 6) {
      setError(t('password-must-be-at-least-6-characters'));
      return;
    }

    setLoading(true);
    try {
      await registerUser(login, password, email);
      const data = await loginUser(login, password);
      setAuth(data.token, login);
      window.location.href = '/';
    } catch (err: any) {
      let errorMessage = err.message || t('registration-failed');
      if (errorMessage.includes(t('already-exists'))) {
        errorMessage = t('username-is-already-taken');
      } else if (errorMessage.includes(t('invalid-data'))) {
        errorMessage =
          t('invalid-form-data-make-sure-your-email-is-correct-and-try-again');
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='auth-card'>
      <div className='auth-header'>
        <h1 className='auth-title'>{t('create-account')}</h1>
        <p className='auth-subtitle'>{t('join-ai-detector')}</p>
      </div>

      {error && <div className='auth-error'>{error}</div>}
      {success && <div className='auth-success'>{success}</div>}

      <form onSubmit={handleSubmit} className='auth-form'>
        <div className='form-group'>
          <label htmlFor='login'>{t('username')}</label>
          <input
            id='login'
            type='text'
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder={t('choose-a-username')}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='email'>{t('email')}</label>
          <input
            id='email'
            type='email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('enter-your-email')}
            required
          />
        </div>

        <div className='form-group'>
          <label htmlFor='password'>{t('password')}</label>
          <input
            id='password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('create-a-password')}
            required
            minLength={6}
          />
        </div>

        <div className='form-group'>
          <label htmlFor='confirmPassword'>{t('confirm-password')}</label>
          <input
            id='confirmPassword'
            type='password'
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={t('confirm-your-password')}
            required
          />
        </div>

        <button type='submit' className='auth-submit' disabled={loading}>
          {loading ? t('creating-account') : t('create-account')}
        </button>
      </form>

      <p className='auth-switch'>
        {t('already-have-an-account')} <a href='/login'>{t('sign-in-0')}</a>
      </p>
    </div>
  );
}
