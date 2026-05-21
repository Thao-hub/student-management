import React from 'react';
import './Navbar.css';
import { useAuth, useLanguage } from '../hooks';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const { language, setLanguage, t } = useLanguage();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const localizedRole = user ? t.navbar.userRole[user.role] || user.role : '';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <h1>{t.common.studentManagementSystem}</h1>
        </div>

        <div className="navbar-menu">
          <a href="/dashboard" className="nav-link">{t.common.dashboard}</a>
          <a href="/students" className="nav-link">{t.common.students}</a>
          <a href="/classes" className="nav-link">{t.common.classes}</a>
          <a href="/subjects" className="nav-link">{t.common.subjects}</a>
        </div>

        <div className="navbar-user">
          <div className="language-switcher navbar-language-switcher" aria-label="Language switcher">
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

          {user && (
            <>
              <span className="user-info">
                {user.username} ({localizedRole})
              </span>
              <button onClick={handleLogout} className="logout-btn">
                {t.common.logout}
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
