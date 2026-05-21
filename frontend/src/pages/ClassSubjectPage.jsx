import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import {
  AcademicTermService,
  ClassService,
  ClassSubjectService,
  SubjectService
} from '../services/studentService';
import { getTeachers } from '../services/teacherService';
import './StudentPage.css';

const EMPTY_FORM = {
  class_id: '',
  subject_id: '',
  academic_term_id: '',
  teacher_id: '',
  assigned_at: '',
  is_required: true
};

export default function ClassSubjectPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const pageCopy = t.classSubjectsPage;
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const { classSubjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [items, setItems] = React.useState([]);
  const [classes, setClasses] = React.useState([]);
  const [subjects, setSubjects] = React.useState([]);
  const [terms, setTerms] = React.useState([]);
  const [teachers, setTeachers] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingItem, setEditingItem] = React.useState(null);
  const [formData, setFormData] = React.useState(EMPTY_FORM);

  const classNameById = React.useMemo(
    () => new Map(classes.map((item) => [item.id, item.name])),
    [classes]
  );
  const subjectNameById = React.useMemo(
    () => new Map(subjects.map((item) => [item.id, `${item.code} - ${item.name}`])),
    [subjects]
  );
  const termNameById = React.useMemo(
    () => new Map(terms.map((item) => [item.id, `${item.name} (${item.academic_year})`])),
    [terms]
  );
  const teacherNameById = React.useMemo(
    () =>
      new Map(
        teachers.map((item) => [item.id, `${item.ma_giao_vien} - ${item.ho} ${item.ten}`])
      ),
    [teachers]
  );

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classSubjectResponse, classResponse, subjectResponse, termResponse, teacherResponse] =
        await Promise.all([
          ClassSubjectService.getClassSubjects(),
          ClassService.getClasses(),
          SubjectService.getSubjects(),
          AcademicTermService.getTerms(),
          getTeachers()
        ]);

      setItems(classSubjectResponse.data);
      setClasses(classResponse.data);
      setSubjects(subjectResponse.data);
      setTerms(termResponse.data);
      setTeachers(teacherResponse.data);
    } catch (error) {
      console.error('Failed to fetch class subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    const openCreate = location.pathname.endsWith('/create');
    if (openCreate) {
      setEditingItem(null);
      setShowForm(true);
      return;
    }

    if (classSubjectId) {
      (async () => {
        try {
          const response = await ClassSubjectService.getClassSubject(classSubjectId);
          setEditingItem(response.data);
          setShowForm(true);
        } catch (error) {
          console.error('Failed to load class subject:', error);
          navigate('/class-subjects', { replace: true });
        }
      })();
      return;
    }

    setShowForm(false);
    setEditingItem(null);
  }, [classSubjectId, location.pathname, navigate]);

  React.useEffect(() => {
    setFormData(
      editingItem
        ? {
            class_id: String(editingItem.class_id),
            subject_id: String(editingItem.subject_id),
            academic_term_id: String(editingItem.academic_term_id),
            teacher_id: editingItem.teacher_id ? String(editingItem.teacher_id) : '',
            assigned_at: editingItem.assigned_at || '',
            is_required: Boolean(editingItem.is_required)
          }
        : EMPTY_FORM
    );
  }, [editingItem]);

  const filteredItems = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return items;

    return items.filter((item) => {
      const key = [
        item.id,
        classNameById.get(item.class_id) || item.class_id,
        subjectNameById.get(item.subject_id) || item.subject_id,
        termNameById.get(item.academic_term_id) || item.academic_term_id,
        teacherNameById.get(item.teacher_id) || '',
        item.is_required ? pageCopy.required : pageCopy.optional
      ]
        .join(' ')
        .toLowerCase();
      return key.includes(term);
    });
  }, [items, searchTerm, classNameById, subjectNameById, termNameById, teacherNameById, pageCopy.required, pageCopy.optional]);

  const resetForm = () => {
    setShowForm(false);
    setEditingItem(null);
    navigate('/class-subjects');
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }

    setLoading(true);
    try {
      const payload = {
        class_id: Number(formData.class_id),
        subject_id: Number(formData.subject_id),
        academic_term_id: Number(formData.academic_term_id),
        teacher_id: formData.teacher_id ? Number(formData.teacher_id) : null,
        assigned_at: formData.assigned_at || null,
        is_required: Boolean(formData.is_required)
      };

      if (editingItem) {
        await ClassSubjectService.updateClassSubject(editingItem.id, payload);
      } else {
        await ClassSubjectService.createClassSubject(payload);
      }

      resetForm();
      await fetchData();
    } catch (error) {
      console.error('Failed to save class subject:', error);
      window.alert(error.response?.data?.detail || 'Failed to save class subject');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    navigate(`/class-subjects/edit/${item.id}`);
  };

  const handleDelete = async (id) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    if (!window.confirm(pageCopy.confirmDelete)) return;

    try {
      await ClassSubjectService.deleteClassSubject(id);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete class subject:', error);
      window.alert(error.response?.data?.detail || 'Failed to delete class subject');
    }
  };

  const handleExportCsv = () => {
    exportToCsv(
      'class-subjects.csv',
      filteredItems.map((item) => ({
        id: item.id,
        class: classNameById.get(item.class_id) || item.class_id,
        subject: subjectNameById.get(item.subject_id) || item.subject_id,
        term: termNameById.get(item.academic_term_id) || item.academic_term_id,
        teacher: teacherNameById.get(item.teacher_id) || '',
        assigned_at: item.assigned_at || '',
        is_required: item.is_required ? pageCopy.required : pageCopy.optional
      }))
    );
  };

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="class-subjects" />
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
                  onClick={() => navigate(showForm ? '/class-subjects' : '/class-subjects/create')}
                >
                  {showForm ? commonCopy.close : pageCopy.addClassSubject}
                </button>
              )}
            </div>
          </section>

          {showForm && canManage && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingItem ? pageCopy.editClassSubject : pageCopy.addClassSubject}</h2>
              </div>
              <form className="compact-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <select name="class_id" value={formData.class_id} onChange={handleChange} required disabled={loading}>
                    <option value="">{pageCopy.classLabel}</option>
                    {classes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>

                  <select name="subject_id" value={formData.subject_id} onChange={handleChange} required disabled={loading}>
                    <option value="">{pageCopy.subjectLabel}</option>
                    {subjects.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.code} - {item.name}
                      </option>
                    ))}
                  </select>

                  <select
                    name="academic_term_id"
                    value={formData.academic_term_id}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  >
                    <option value="">{pageCopy.termLabel}</option>
                    {terms.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name} ({item.academic_year})
                      </option>
                    ))}
                  </select>

                  <select name="teacher_id" value={formData.teacher_id} onChange={handleChange} disabled={loading}>
                    <option value="">{pageCopy.teacherLabel}</option>
                    {teachers.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.ma_giao_vien} - {item.ho} {item.ten}
                      </option>
                    ))}
                  </select>

                  <input
                    type="date"
                    name="assigned_at"
                    value={formData.assigned_at}
                    onChange={handleChange}
                    disabled={loading}
                    placeholder={pageCopy.assignedAt}
                  />

                  <label className="detail-info-item" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <input
                      type="checkbox"
                      name="is_required"
                      checked={Boolean(formData.is_required)}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span style={{ marginBottom: 0 }}>{pageCopy.isRequired}</span>
                  </label>
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? commonCopy.loading : editingItem ? commonCopy.update : commonCopy.save}
                  </button>
                  <button type="button" className="btn-primary btn-secondary-tone" onClick={resetForm} disabled={loading}>
                    {commonCopy.close}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="toolbar-card">
            <input
              type="text"
              className="search-input"
              placeholder={pageCopy.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="students-table-section">
            {loading && !showForm ? (
              <p className="loading">{commonCopy.loading}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.classSubjectId}</th>
                    <th>{pageCopy.classLabel}</th>
                    <th>{pageCopy.subjectLabel}</th>
                    <th>{pageCopy.termLabel}</th>
                    <th>{pageCopy.teacherLabel}</th>
                    <th>{pageCopy.assignedAt}</th>
                    <th>{pageCopy.isRequired}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredItems.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-data">
                        {commonCopy.noData}
                      </td>
                    </tr>
                  ) : (
                    filteredItems.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.id}</td>
                        <td>{classNameById.get(item.class_id) || item.class_id}</td>
                        <td>{subjectNameById.get(item.subject_id) || item.subject_id}</td>
                        <td>{termNameById.get(item.academic_term_id) || item.academic_term_id}</td>
                        <td>{teacherNameById.get(item.teacher_id) || '-'}</td>
                        <td>{item.assigned_at || '-'}</td>
                        <td>{item.is_required ? pageCopy.required : pageCopy.optional}</td>
                        <td className="actions">
                          {canManage ? (
                            <>
                              <button type="button" className="btn-small btn-info" onClick={() => handleEdit(item)}>
                                {commonCopy.edit}
                              </button>
                              <button type="button" className="btn-small btn-danger" onClick={() => handleDelete(item.id)}>
                                {commonCopy.delete}
                              </button>
                            </>
                          ) : (
                            <span className="muted-text">{commonCopy.viewOnly}</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
