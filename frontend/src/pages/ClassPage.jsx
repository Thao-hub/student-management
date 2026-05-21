import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ClassService } from '../services/studentService';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import './StudentPage.css';

const EMPTY_CLASS = {
  name: '',
  grade_level: '',
  academic_year: '',
  capacity: ''
};

export const ClassPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const pageCopy = t.classesPage;
  const commonCopy = t.common;
  const detailsLabel = commonCopy.details;
  const [classes, setClasses] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [editingClass, setEditingClass] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [formData, setFormData] = React.useState(EMPTY_CLASS);
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const response = await ClassService.getClasses();
      setClasses(response.data);
    } catch (error) {
      console.error('Failed to fetch classes:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchClasses();
  }, []);

  React.useEffect(() => {
    setFormData(
      editingClass
        ? {
            name: editingClass.name || '',
            grade_level: editingClass.grade_level || '',
            academic_year: editingClass.academic_year || '',
            capacity: editingClass.capacity || ''
          }
        : EMPTY_CLASS
    );
  }, [editingClass]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (editingClass) {
        await ClassService.updateClass(editingClass.id, formData);
      } else {
        await ClassService.createClass({
          ...formData,
          capacity: formData.capacity ? Number(formData.capacity) : null
        });
      }
      setEditingClass(null);
      setShowForm(false);
      await fetchClasses();
    } catch (error) {
      console.error('Failed to save class:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (classId) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    if (!window.confirm(pageCopy.confirmDelete)) return;
    try {
      await ClassService.deleteClass(classId);
      await fetchClasses();
    } catch (error) {
      console.error('Failed to delete class:', error);
    }
  };

  const filteredClasses = classes.filter((item) =>
    `${item.name} ${item.academic_year || ''} ${item.grade_level || ''}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="classes" />
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
                    'classes.csv',
                    filteredClasses.map((item) => ({
                      name: item.name,
                      grade_level: item.grade_level || '',
                      academic_year: item.academic_year || '',
                      capacity: item.capacity || ''
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
                    setEditingClass(null);
                    setShowForm((prev) => !prev);
                  }}
                >
                  {showForm ? commonCopy.close : pageCopy.addClass}
                </button>
              )}
            </div>
          </section>

          {showForm && canManage && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingClass ? pageCopy.editClass : pageCopy.addClass}</h2>
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
                    value={formData.grade_level}
                    onChange={(e) => setFormData((prev) => ({ ...prev, grade_level: e.target.value }))}
                    placeholder={pageCopy.gradeLevel}
                  />
                  <input
                    value={formData.academic_year}
                    onChange={(e) => setFormData((prev) => ({ ...prev, academic_year: e.target.value }))}
                    placeholder={pageCopy.academicYear}
                  />
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, capacity: e.target.value }))}
                    placeholder={pageCopy.capacity}
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? commonCopy.loading : editingClass ? commonCopy.update : commonCopy.save}
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
              <p className="loading">{pageCopy.loadingClasses}</p>
            ) : filteredClasses.length === 0 ? (
              <p className="no-data">{pageCopy.noClassesFound}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.name}</th>
                    <th>{pageCopy.gradeLevel}</th>
                    <th>{pageCopy.academicYear}</th>
                    <th>{pageCopy.capacity}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClasses.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.grade_level || '-'}</td>
                      <td>{item.academic_year || '-'}</td>
                      <td>{item.capacity || '-'}</td>
                      <td className="actions">
                        <Link to={`/classes/${item.id}`} className="btn-small btn-info">
                          {detailsLabel}
                        </Link>
                        {canManage ? (
                          <>
                            <button
                              type="button"
                              className="btn-small btn-info"
                              onClick={() => {
                                setEditingClass(item);
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

export default ClassPage;
