import React from 'react';
import './Sidebar.css';
import { useLanguage } from '../hooks';

export const Sidebar = ({ activeMenu }) => {
  const { t } = useLanguage();

  return (
    <aside className="sidebar">
      <div className="sidebar-menu">
        <div className={`menu-item ${activeMenu === 'dashboard' ? 'active' : ''}`}>
          <a href="/dashboard">
            <span className="icon">DB</span>
            <span className="label">{t.common.dashboard}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'students' ? 'active' : ''}`}>
          <a href="/students">
            <span className="icon">SV</span>
            <span className="label">{t.common.students}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'classes' ? 'active' : ''}`}>
          <a href="/classes">
            <span className="icon">LH</span>
            <span className="label">{t.common.classes}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'subjects' ? 'active' : ''}`}>
          <a href="/subjects">
            <span className="icon">MH</span>
            <span className="label">{t.common.subjects}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'class-subjects' ? 'active' : ''}`}>
          <a href="/class-subjects">
            <span className="icon">LM</span>
            <span className="label">{t.common.classSubjects}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'scores' ? 'active' : ''}`}>
          <a href="/scores">
            <span className="icon">DS</span>
            <span className="label">{t.common.scores}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'terms' ? 'active' : ''}`}>
          <a href="/terms">
            <span className="icon">HK</span>
            <span className="label">{t.common.terms}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'rooms' ? 'active' : ''}`}>
          <a href="/rooms">
            <span className="icon">PH</span>
            <span className="label">{t.common.rooms}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'schedule' ? 'active' : ''}`}>
          <a href="/schedule">
            <span className="icon">LC</span>
            <span className="label">{t.common.schedule}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'enrollments' ? 'active' : ''}`}>
          <a href="/enrollments">
            <span className="icon">DK</span>
            <span className="label">{t.common.enrollments}</span>
          </a>
        </div>

        <div className={`menu-item ${activeMenu === 'attendance' ? 'active' : ''}`}>
          <a href="/attendance">
            <span className="icon">DD</span>
            <span className="label">{t.common.attendance}</span>
          </a>
        </div>
        <div className={`menu-item ${activeMenu === 'teachers' ? 'active' : ''}`}>
          <a href="/teachers">
            <span className="icon">GV</span>
            <span className="label">{t.common.teachers}</span>
          </a>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
