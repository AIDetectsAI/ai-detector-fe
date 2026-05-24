import { useState, useEffect } from 'react';

export default function SettingsPanel() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoAnalyze, setAutoAnalyze] = useState(false);
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    setDarkMode(localStorage.getItem('darkMode') === 'true');
    setNotifications(localStorage.getItem('notifications') !== 'false');
    setAutoAnalyze(localStorage.getItem('autoAnalyze') === 'true');
    setLanguage(localStorage.getItem('language') || 'en');
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

  const handleLanguage = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  return (
    <div className='settings-page'>
      <div className='page-header'>
        <h1>Settings</h1>
        <p>Customize your experience</p>
      </div>

      <div className='settings-sections'>
        <div className='settings-section'>
          <h2>Appearance</h2>
          <div className='setting-item'>
            <div className='setting-info'>
              <span className='setting-label'>Dark Mode</span>
              <span className='setting-desc'>
                Switch between light and dark theme
              </span>
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
              <span className='setting-label'>Language</span>
              <span className='setting-desc'>
                Select your preferred language
              </span>
            </div>
            <select
              value={language}
              onChange={(e) => handleLanguage(e.target.value)}
              className='setting-select'
            >
              <option value='en'>English</option>
              <option value='pl'>Polski</option>
            </select>
          </div>
        </div>

        <div className='settings-section'>
          <h2>Analysis</h2>
          <div className='setting-item'>
            <div className='setting-info'>
              <span className='setting-label'>Auto-analyze on upload</span>
              <span className='setting-desc'>
                Automatically start analysis when an image is uploaded
              </span>
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
          <h2>Notifications</h2>
          <div className='setting-item'>
            <div className='setting-info'>
              <span className='setting-label'>Email Notifications</span>
              <span className='setting-desc'>
                Receive email updates about your analyses
              </span>
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
          <h2>Danger Zone</h2>
          <div className='setting-item danger'>
            <div className='setting-info'>
              <span className='setting-label'>Delete Account</span>
              <span className='setting-desc'>
                Permanently delete your account and all data
              </span>
            </div>
            <button
              className='btn-danger'
              onClick={() => alert('Not implemented yet')}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
