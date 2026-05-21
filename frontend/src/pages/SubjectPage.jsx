import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { SubjectService } from '../services/studentService';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import './StudentPage.css';

const EMPTY_SUBJECT = {
  name: '',
  code: '',
  credits: 3,
  description: ''
};

export const SubjectPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const pageCopy = t.subjectsPage;
  const commonCopy = t.common;
  const detailsLabel = commonCopy.details;
  const [subjects, setSubjects] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [editingSubject, setEditingSubject] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [formData, setFormData] = React.useState(EMPTY_SUBJECT);
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const fetchSubjects = async () => {
    setLoading(true);
    try {
      const response = await SubjectService.getSubjects();
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to fetch subjects:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSubjects();
  }, []);

  React.useEffect(() => {
    setFormData(
      editingSubject
        ? {
            name: editingSubject.name || '',
            code: editingSubject.code || '',
            credits: editingSubject.credits || 3,
            description: editingSubject.description || ''
          }
        : EMPTY_SUBJECT
    );
  }, [editingSubject]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...formData,
        credits: Number(formData.credits)
      };
      if (editingSubject) {
        await SubjectService.updateSubject(editingSubject.id, payload);
      } else {
        await SubjectService.createSubject(payload);
      }
      setEditingSubject(null);
      setShowForm(false);
      await fetchSubjects();
    } catch (error) {
      console.error('Failed to save subject:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    if (!window.confirm(pageCopy.confirmDelete)) return;
    try {
      await SubjectService.deleteSubject(subjectId);
      await fetchSubjects();
    } catch (error) {
      console.error('Failed to delete subject:', error);
    }
  };

  const filteredSubjects = subjects.filter((item) =>
    `${item.name} ${item.code}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="subjects" />
        <main className="main-content">
          <section className="content-hero">
            <div>
              <h1>{pageCopy.title}</h1>
              <p>{pageCopy.description}</p>
            </div>
            <div className="content-hero-actions">
              <button
                type="button"
                className="btn-primary btn-secondary-tone"
                onClick={() =>
                  exportToCsv(
                    'subjects.csv',
                    filteredSubjects.map((item) => ({
                      name: item.name,
                      code: item.code,
                      credits: item.credits,
                      description: item.description || ''
                    }))
                  )
                }
              >
                {commonCopy.exportCsv}
              </button>
              {canManage && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setEditingSubject(null);
                    setShowForm((prev) => !prev);
                  }}
                >
                  {showForm ? commonCopy.close : pageCopy.addSubject}
                </button>
              )}
            </div>
          </section>

          {showForm && canManage && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingSubject ? pageCopy.editSubject : pageCopy.addSubject}</h2>
              </div>
              <form className="compact-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                  <input
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder={pageCopy.name}
                    required
                  />
                  <input
                    value={formData.code}
                    onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                    placeholder={pageCopy.code}
                    required
                  />
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={formData.credits}
                    onChange={(e) => setFormData((prev) => ({ ...prev, credits: e.target.value }))}
                    placeholder={pageCopy.credits}
                    required
                  />
                </div>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  placeholder={pageCopy.descriptionLabel}
                  rows="4"
                />
                <div className="form-actions">
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? commonCopy.loading : editingSubject ? commonCopy.update : commonCopy.save}
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
              <p className="loading">{pageCopy.loadingSubjects}</p>
            ) : filteredSubjects.length === 0 ? (
              <p className="no-data">{pageCopy.noSubjectsFound}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.name}</th>
                    <th>{pageCopy.code}</th>
                    <th>{pageCopy.credits}</th>
                    <th>{pageCopy.descriptionLabel}</th>
                    <th>{commonCopy.status}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSubjects.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.code}</td>
                      <td>{item.credits}</td>
                      <td>{item.description || '-'}</td>
                      <td>
                        <span className={`status ${item.is_active ? 'active' : 'inactive'}`}>
                          {item.is_active ? pageCopy.active : pageCopy.inactive}
                        </span>
                      </td>
                      <td className="actions">
                        <Link to={`/subjects/${item.id}`} className="btn-small btn-info">
                          {detailsLabel}
                        </Link>
                        {canManage ? (
                          <>
                            <button
                              type="button"
                              className="btn-small btn-info"
                              onClick={() => {
                                setEditingSubject(item);
                                setShowForm(true);
                              }}
                            >
                              {commonCopy.edit}
                            </button>
                            <button
                              type="button"
                              className="btn-small btn-danger"
                              onClick={() => handleDelete(item.id)}
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
};

export default SubjectPage;
