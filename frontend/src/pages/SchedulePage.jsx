import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import ScheduleForm from '../components/ScheduleForm';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import { ScheduleService } from '../services/studentService';
import './StudentPage.css';

export default function SchedulePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const pageCopy = t.schedulePage;
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const { scheduleId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [schedules, setSchedules] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingSchedule, setEditingSchedule] = React.useState(null);

  const fetchSchedules = async () => {
    setLoading(true);
    try {
      const response = await ScheduleService.getSchedules();
      setSchedules(response.data);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSchedules();
  }, []);

  React.useEffect(() => {
    const openCreate = location.pathname.endsWith('/create');
    if (openCreate) {
      setEditingSchedule(null);
      setShowForm(true);
      return;
    }

    if (scheduleId) {
      (async () => {
        try {
          const response = await ScheduleService.getSchedule(scheduleId);
          setEditingSchedule(response.data);
          setShowForm(true);
        } catch (error) {
          console.error('Failed to load schedule:', error);
          navigate('/schedule', { replace: true });
        }
      })();
      return;
    }

    setShowForm(false);
    setEditingSchedule(null);
  }, [scheduleId, location.pathname, navigate]);

  const filteredSchedules = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return schedules;
    return schedules.filter((item) => {
      const key =
        `${item.class_subject_id} ${item.teacher_id} ${item.room_id || ''} ${item.day_of_week} ` +
        `${item.start_time} ${item.end_time}`.toLowerCase();
      return key.includes(term);
    });
  }, [searchTerm, schedules]);

  const resetForm = () => {
    setShowForm(false);
    setEditingSchedule(null);
    navigate('/schedule');
  };

  const handleSaveSchedule = async (formData) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }

    setLoading(true);
    try {
      if (editingSchedule) {
        await ScheduleService.updateSchedule(editingSchedule.id, formData);
      } else {
        await ScheduleService.createSchedule(formData);
      }
      resetForm();
      await fetchSchedules();
    } catch (error) {
      console.error('Failed to save schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditSchedule = (item) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    navigate(`/schedule/edit/${item.id}`);
  };

  const handleDeleteSchedule = async (id) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    if (window.confirm(pageCopy.confirmDelete)) {
      try {
        await ScheduleService.deleteSchedule(id);
        await fetchSchedules();
      } catch (error) {
        console.error('Failed to delete schedule:', error);
      }
    }
  };

  const handleExportCsv = () => {
    exportToCsv('schedule.csv', filteredSchedules);
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="schedule" />
        <main className="main-content">
          <section className="content-hero">
            <div>
              <h1>{pageCopy.title}</h1>
              <p>{pageCopy.description}</p>
            </div>
            <div className="content-hero-actions">
              <button type="button" className="btn-primary btn-secondary-tone" onClick={handleExportCsv}>
                {commonCopy.exportCsv}
              </button>
              {canManage && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate(showForm ? '/schedule' : '/schedule/create')}
                >
                  {showForm ? commonCopy.close : pageCopy.addSchedule}
                </button>
              )}
            </div>
          </section>

          {showForm && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingSchedule ? pageCopy.editSchedule : pageCopy.addSchedule}</h2>
              </div>
              <ScheduleForm onSubmit={handleSaveSchedule} initialData={editingSchedule} isLoading={loading} />
              <div className="form-actions">
                <button type="button" className="btn-primary btn-secondary-tone" onClick={resetForm} disabled={loading}>
                  {commonCopy.close}
                </button>
              </div>
            </div>
          )}

          <div className="toolbar-card">
            <input
              type="text"
              placeholder={pageCopy.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="students-table-section">
            {loading && !showForm ? (
              <p className="loading">{commonCopy.loading}</p>
            ) : filteredSchedules.length === 0 ? (
              <p className="no-data">{commonCopy.noData}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.id}</th>
                    <th>{pageCopy.classSubject}</th>
                    <th>{pageCopy.teacher}</th>
                    <th>{pageCopy.room}</th>
                    <th>{pageCopy.dayOfWeek}</th>
                    <th>{pageCopy.startTime}</th>
                    <th>{pageCopy.endTime}</th>
                    <th>{pageCopy.active}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSchedules.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.class_subject_id}</td>
                      <td>{item.teacher_id}</td>
                      <td>{item.room_id ?? '-'}</td>
                      <td>{pageCopy.days?.[item.day_of_week] ?? item.day_of_week}</td>
                      <td>{item.start_time}</td>
                      <td>{item.end_time}</td>
                      <td>{item.is_active ? commonCopy.yes : commonCopy.no}</td>
                      <td className="actions">
                        {canManage ? (
                          <>
                            <button type="button" className="btn-small btn-info" onClick={() => handleEditSchedule(item)}>
                              {commonCopy.edit}
                            </button>
                            <button
                              type="button"
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteSchedule(item.id)}
                            >
                              {commonCopy.delete}
                            </button>
                          </>
                        ) : (
                          <span className="muted-text">{commonCopy.viewOnly}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

