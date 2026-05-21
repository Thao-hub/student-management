import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AttendanceForm from '../components/AttendanceForm';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import { AttendanceService } from '../services/studentService';
import './StudentPage.css';

export default function AttendancePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const pageCopy = t.attendancePage;
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const { attendanceId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [records, setRecords] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingRecord, setEditingRecord] = React.useState(null);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await AttendanceService.getAttendance();
      setRecords(response.data);
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRecords();
  }, []);

  React.useEffect(() => {
    const openCreate = location.pathname.endsWith('/create');
    if (openCreate) {
      setEditingRecord(null);
      setShowForm(true);
      return;
    }

    if (attendanceId) {
      (async () => {
        try {
          const response = await AttendanceService.getAttendanceRecord(attendanceId);
          setEditingRecord(response.data);
          setShowForm(true);
        } catch (error) {
          console.error('Failed to load attendance record:', error);
          navigate('/attendance', { replace: true });
        }
      })();
      return;
    }

    setShowForm(false);
    setEditingRecord(null);
  }, [attendanceId, location.pathname, navigate]);

  const filteredRecords = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return records;
    return records.filter((item) => {
      const key =
        `${item.enrollment_id} ${item.class_schedule_id} ${item.class_subject_id} ${item.attendance_date} ${item.status} ` +
        `${item.notes || ''}`.toLowerCase();
      return key.includes(term);
    });
  }, [records, searchTerm]);

  const resetForm = () => {
    setShowForm(false);
    setEditingRecord(null);
    navigate('/attendance');
  };

  const handleSaveRecord = async (formData) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }

    setLoading(true);
    try {
      if (editingRecord) {
        await AttendanceService.updateAttendance(editingRecord.id, formData);
      } else {
        await AttendanceService.createAttendance(formData);
      }
      resetForm();
      await fetchRecords();
    } catch (error) {
      console.error('Failed to save attendance record:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = (item) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    navigate(`/attendance/edit/${item.id}`);
  };

  const handleDeleteRecord = async (id) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    if (window.confirm(pageCopy.confirmDelete)) {
      try {
        await AttendanceService.deleteAttendance(id);
        await fetchRecords();
      } catch (error) {
        console.error('Failed to delete attendance record:', error);
      }
    }
  };

  const handleExportCsv = () => {
    exportToCsv('attendance.csv', filteredRecords);
  };

  const renderStatusLabel = (value) => pageCopy.statusLabels?.[value] ?? value;

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="attendance" />
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
                  onClick={() => navigate(showForm ? '/attendance' : '/attendance/create')}
                >
                  {showForm ? commonCopy.close : pageCopy.addAttendance}
                </button>
              )}
            </div>
          </section>

          {showForm && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingRecord ? pageCopy.editAttendance : pageCopy.addAttendance}</h2>
              </div>
              <AttendanceForm onSubmit={handleSaveRecord} initialData={editingRecord} isLoading={loading} />
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
            ) : filteredRecords.length === 0 ? (
              <p className="no-data">{commonCopy.noData}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.id}</th>
                    <th>{pageCopy.enrollment}</th>
                    <th>{pageCopy.schedule}</th>
                    <th>{pageCopy.classSubject}</th>
                    <th>{pageCopy.date}</th>
                    <th>{pageCopy.status}</th>
                    <th>{pageCopy.notes}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{item.enrollment_id}</td>
                      <td>{item.class_schedule_id}</td>
                      <td>{item.class_subject_id}</td>
                      <td>{item.attendance_date}</td>
                      <td>{renderStatusLabel(item.status)}</td>
                      <td>{item.notes || '-'}</td>
                      <td className="actions">
                        {canManage ? (
                          <>
                            <button type="button" className="btn-small btn-info" onClick={() => handleEditRecord(item)}>
                              {commonCopy.edit}
                            </button>
                            <button
                              type="button"
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteRecord(item.id)}
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

