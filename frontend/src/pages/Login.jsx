import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, useLanguage } from '../hooks';
import portalLogo from '../assets/logo_3_1.png';
import './Login.css';

export const Login = () => {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');

  const { login, loading, error } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const loginCopy = t.login;

  const handleLogin = async (e) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="login-shell">
      <div className="login-backdrop" />

      <section className="login-panel">
        <div className="login-showcase">
          <p className="showcase-kicker">{loginCopy.showcaseKicker || loginCopy.title}</p>
          <div className="showcase-logo-wrap">
            <img src={portalLogo} alt="Education logo" className="showcase-logo" />
          </div>
          <h1 className="showcase-title">{loginCopy.showcaseTitle || loginCopy.title}</h1>
          <p className="showcase-text">{loginCopy.description}</p>

          <div className="showcase-highlights">
            <div className="highlight-card">
              <span className="highlight-value">24/7</span>
              <span className="highlight-label">{loginCopy.access}</span>
            </div>
            <div className="highlight-card">
              <span className="highlight-value">Fast</span>
              <span className="highlight-label">{loginCopy.flow}</span>
            </div>
            <div className="highlight-card">
              <span className="highlight-value">Secure</span>
              <span className="highlight-label">{loginCopy.secure}</span>
            </div>
          </div>
        </div>

        <div className="login-card">
          <div className="language-switcher" aria-label="Language switcher">
            <button
              type="button"
              className={language === 'vi' ? 'language-btn active' : 'language-btn'}
              onClick={() => setLanguage('vi')}
            >
              VI
            </button>
            <button
              type="button"
              className={language === 'en' ? 'language-btn active' : 'language-btn'}
              onClick={() => setLanguage('en')}
            >
              EN
            </button>
          </div>

          <div className="login-card-header">
            <div className="brand-mark" aria-hidden="true">
              <span className="brand-mark-square brand-mark-square-a" />
              <span className="brand-mark-square brand-mark-square-b" />
            </div>
            <div>
              <p className="login-eyebrow">{loginCopy.welcome}</p>
              <h2>{loginCopy.signIn}</h2>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="username">{loginCopy.username}</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={loginCopy.usernamePlaceholder}
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{loginCopy.password}</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={loginCopy.passwordPlaceholder}
                disabled={loading}
              />
            </div>

            <button type="submit" className="btn-login" disabled={loading}>
              {loading ? loginCopy.loggingIn : loginCopy.loginButton}
            </button>

            <p className="form-footer">{loginCopy.accountNotice}</p>
            <p className="form-footer support-text">{loginCopy.supportNotice}</p>
          </form>
        </div>
      </section>
    </div>
  );
};

export default Login;
