import React, { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    theme: 'light',
    notifications: true,
    autoSave: true,
    language: 'en',
  });

  const handleChange = (key, value) => {
    setSettings({ ...settings, [key]: value });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Settings MFE</h1>
      <form style={{ maxWidth: '500px' }}>
        <div style={{ marginBottom: '15px' }}>
          <label>
            Theme:
            <select value={settings.theme} onChange={(e) => handleChange('theme', e.target.value)}>
              <option>light</option>
              <option>dark</option>
              <option>auto</option>
            </select>
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={settings.notifications}
              onChange={(e) => handleChange('notifications', e.target.checked)}
            />
            Enable Notifications
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            <input
              type="checkbox"
              checked={settings.autoSave}
              onChange={(e) => handleChange('autoSave', e.target.checked)}
            />
            Auto Save
          </label>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>
            Language:
            <select value={settings.language} onChange={(e) => handleChange('language', e.target.value)}>
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
            </select>
          </label>
        </div>

        <button type="submit">Save Settings</button>
      </form>
    </div>
  );
}
