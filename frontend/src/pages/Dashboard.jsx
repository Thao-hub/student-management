import React from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useLanguage } from '../hooks';
import { ClassService, ScoreService, StudentService, SubjectService } from '../services/studentService';
import './Dashboard.css';

export const Dashboard = () => {
  const { t } = useLanguage();
  const [stats, setStats] = React.useState({
    totalStudents: 0,
    totalClasses: 0,
    totalSubjects: 0,
    averageScore: 0
  });

  const [recentStudents, setRecentStudents] = React.useState([]);

  const renderStatusLabel = (status) => {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'active') return t.studentsPage.active;
    if (normalized === 'inactive') return t.studentsPage.inactive;
    if (normalized === 'graduated') return t.studentsPage.graduated;
    if (normalized === 'suspended') return t.studentsPage.suspended;
    return status;
  };

  React.useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [studentsRes, classesRes, subjectsRes, scoresRes] = await Promise.all([
          StudentService.getStudents(),
          ClassService.getClasses(),
          SubjectService.getSubjects(),
          ScoreService.getScores()
        ]);

        const studentList = studentsRes.data || [];
        const classList = classesRes.data || [];
        const subjectList = subjectsRes.data || [];
        const scoreList = scoresRes.data || [];
        const averageScore = scoreList.length
          ? (
              scoreList.reduce((sum, item) => sum + Number(item.score || 0), 0) / scoreList.length
            ).toFixed(2)
          : 0;

        setStats({
          totalStudents: studentList.length,
          totalClasses: classList.length,
          totalSubjects: subjectList.length,
          averageScore
        });
        setRecentStudents(studentList.slice(-5).reverse());
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="dashboard" />
        <main className="main-content">
          <div className="dashboard-header">
            <h1>{t.dashboard.title}</h1>
            <p>{t.dashboard.welcome}</p>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">Students</div>
              <div className="stat-content">
                <h3>{t.dashboard.totalStudents}</h3>
                <p className="stat-value">{stats.totalStudents}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">Classes</div>
              <div className="stat-content">
                <h3>{t.dashboard.totalClasses}</h3>
                <p className="stat-value">{stats.totalClasses}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">Subjects</div>
              <div className="stat-content">
                <h3>{t.dashboard.totalSubjects}</h3>
                <p className="stat-value">{stats.totalSubjects}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">Score</div>
              <div className="stat-content">
                <h3>{t.dashboard.averageScore}</h3>
                <p className="stat-value">{stats.averageScore}</p>
              </div>
            </div>
          </div>

          <div className="dashboard-sections">
            <section className="dashboard-section">
              <h2>{t.dashboard.latestStudents}</h2>
              {recentStudents.length === 0 ? (
                <p>{t.dashboard.noRecentActivity}</p>
              ) : (
                <div className="recent-list">
                  {recentStudents.map((student) => (
                    <div key={student.id} className="recent-item">
                      <div>
                        <strong>{student.last_name} {student.first_name}</strong>
                        <p>{student.student_code} • {student.email}</p>
                      </div>
                      <span className={`status ${String(student.status || '').toLowerCase()}`}>
                        {renderStatusLabel(student.status)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="dashboard-section">
              <h2>{t.dashboard.quickActions}</h2>
              <div className="quick-actions">
                <a href="/students" className="action-btn">
                  + {t.dashboard.addStudent}
                </a>
                <a href="/classes" className="action-btn">
                  + {t.dashboard.addClass}
                </a>
                <a href="/subjects" className="action-btn">
                  + {t.dashboard.addSubject}
                </a>
                <a href="/scores" className="action-btn">
                  + {t.dashboard.recordScore}
                </a>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
