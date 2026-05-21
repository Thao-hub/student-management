import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import TeacherForm from '../components/TeacherForm';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import { createTeacher, deleteTeacher, getTeacherById, getTeachers, updateTeacher } from '../services/teacherService';
import './StudentPage.css';

export default function TeacherList() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const pageCopy = t.teachersPage;
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [teachers, setTeachers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingTeacher, setEditingTeacher] = React.useState(null);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const response = await getTeachers();
      setTeachers(response.data);
    } catch (error) {
      console.error('Failed to fetch teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTeachers();
  }, []);

  React.useEffect(() => {
    const openCreate = location.pathname.endsWith('/create');
    if (openCreate) {
      setEditingTeacher(null);
      setShowForm(true);
      return;
    }

    if (id) {
      (async () => {
        try {
          const response = await getTeacherById(id);
          setEditingTeacher(response.data);
          setShowForm(true);
        } catch (error) {
          console.error('Failed to load teacher:', error);
          navigate('/teachers', { replace: true });
        }
      })();
      return;
    }

    setShowForm(false);
    setEditingTeacher(null);
  }, [id, location.pathname, navigate]);

  const filteredTeachers = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return teachers;

    return teachers.filter((teacher) => {
      const fullName = `${teacher.ho || ''} ${teacher.ten || ''}`.trim().toLowerCase();
      return (
        String(teacher.ma_giao_vien || '').toLowerCase().includes(term) ||
        fullName.includes(term) ||
        String(teacher.email || '').toLowerCase().includes(term) ||
        String(teacher.so_dien_thoai || '').toLowerCase().includes(term) ||
        String(teacher.trinh_do || '').toLowerCase().includes(term)
      );
    });
  }, [searchTerm, teachers]);

  const resetForm = () => {
    setShowForm(false);
    setEditingTeacher(null);
    navigate('/teachers');
  };

  const handleSaveTeacher = async (formData) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }

    setLoading(true);
    try {
      if (editingTeacher) {
        await updateTeacher(editingTeacher.id, formData);
      } else {
        await createTeacher(formData);
      }
      resetForm();
      await fetchTeachers();
    } catch (error) {
      console.error('Failed to save teacher:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTeacher = (teacher) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    navigate(`/teachers/edit/${teacher.id}`);
  };

  const handleDeleteTeacher = async (teacherId) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }

    if (window.confirm(pageCopy.confirmDelete)) {
      try {
        await deleteTeacher(teacherId);
        await fetchTeachers();
      } catch (error) {
        console.error('Failed to delete teacher:', error);
      }
    }
  };

  const handleExportCsv = () => {
    const rows = filteredTeachers.map((teacher) => ({
      ma_giao_vien: teacher.ma_giao_vien,
      ho: teacher.ho,
      ten: teacher.ten,
      email: teacher.email,
      so_dien_thoai: teacher.so_dien_thoai,
      trinh_do: teacher.trinh_do,
      ngay_vao_lam: teacher.ngay_vao_lam || ''
    }));
    exportToCsv('teachers.csv', rows);
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="teachers" />
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
                <button type="button" className="btn-primary" onClick={() => navigate(showForm ? '/teachers' : '/teachers/create')}>
                  {showForm ? commonCopy.close : pageCopy.addTeacher}
                </button>
              )}
            </div>
          </section>

          {showForm && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingTeacher ? pageCopy.editTeacher : pageCopy.addTeacher}</h2>
              </div>
              <TeacherForm onSubmit={handleSaveTeacher} initialData={editingTeacher} isLoading={loading} />
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
            ) : filteredTeachers.length === 0 ? (
              <p className="no-data">{commonCopy.noData}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.teacherCode}</th>
                    <th>{pageCopy.name}</th>
                    <th>{pageCopy.email}</th>
                    <th>{pageCopy.phone}</th>
                    <th>{pageCopy.qualification}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((teacher) => (
                    <tr key={teacher.id}>
                      <td>{teacher.ma_giao_vien}</td>
                      <td>
                        {teacher.ho} {teacher.ten}
                      </td>
                      <td>{teacher.email}</td>
                      <td>{teacher.so_dien_thoai || '-'}</td>
                      <td>{teacher.trinh_do || '-'}</td>
                      <td className="actions">
                        {canManage ? (
                          <>
                            <button type="button" onClick={() => handleEditTeacher(teacher)} className="btn-small btn-info">
                              {commonCopy.edit}
                            </button>
                            <button type="button" onClick={() => handleDeleteTeacher(teacher.id)} className="btn-small btn-danger">
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

