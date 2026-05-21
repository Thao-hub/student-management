import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import AcademicTermForm from '../components/AcademicTermForm';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import { AcademicTermService } from '../services/studentService';
import './StudentPage.css';

export default function AcademicTermPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const pageCopy = t.termsPage;
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const { termId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [terms, setTerms] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingTerm, setEditingTerm] = React.useState(null);

  const fetchTerms = async () => {
    setLoading(true);
    try {
      const response = await AcademicTermService.getTerms();
      setTerms(response.data);
    } catch (error) {
      console.error('Failed to fetch terms:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTerms();
  }, []);

  React.useEffect(() => {
    const openCreate = location.pathname.endsWith('/create');
    if (openCreate) {
      setEditingTerm(null);
      setShowForm(true);
      return;
    }

    if (termId) {
      (async () => {
        try {
          const response = await AcademicTermService.getTerm(termId);
          setEditingTerm(response.data);
          setShowForm(true);
        } catch (error) {
          console.error('Failed to load term:', error);
          navigate('/terms', { replace: true });
        }
      })();
      return;
    }

    setShowForm(false);
    setEditingTerm(null);
  }, [termId, location.pathname, navigate]);

  const filteredTerms = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return terms;
    return terms.filter((item) => {
      const key = `${item.name || ''} ${item.academic_year || ''} ${item.status || ''}`.toLowerCase();
      return key.includes(term);
    });
  }, [searchTerm, terms]);

  const resetForm = () => {
    setShowForm(false);
    setEditingTerm(null);
    navigate('/terms');
  };

  const handleSaveTerm = async (formData) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }

    setLoading(true);
    try {
      if (editingTerm) {
        await AcademicTermService.updateTerm(editingTerm.id, formData);
      } else {
        await AcademicTermService.createTerm(formData);
      }
      resetForm();
      await fetchTerms();
    } catch (error) {
      console.error('Failed to save term:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditTerm = (item) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    navigate(`/terms/edit/${item.id}`);
  };

  const handleDeleteTerm = async (id) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    if (window.confirm(pageCopy.confirmDelete)) {
      try {
        await AcademicTermService.deleteTerm(id);
        await fetchTerms();
      } catch (error) {
        console.error('Failed to delete term:', error);
      }
    }
  };

  const handleExportCsv = () => {
    exportToCsv('terms.csv', filteredTerms);
  };

  const renderStatusLabel = (value) => pageCopy.statusLabels?.[value] ?? value;

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="terms" />
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
                <button type="button" className="btn-primary" onClick={() => navigate(showForm ? '/terms' : '/terms/create')}>
                  {showForm ? commonCopy.close : pageCopy.addTerm}
                </button>
              )}
            </div>
          </section>

          {showForm && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingTerm ? pageCopy.editTerm : pageCopy.addTerm}</h2>
              </div>
              <AcademicTermForm onSubmit={handleSaveTerm} initialData={editingTerm} isLoading={loading} />
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
            ) : filteredTerms.length === 0 ? (
              <p className="no-data">{commonCopy.noData}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.name}</th>
                    <th>{pageCopy.academicYear}</th>
                    <th>{pageCopy.semesterNo}</th>
                    <th>{pageCopy.startDate}</th>
                    <th>{pageCopy.endDate}</th>
                    <th>{pageCopy.status}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTerms.map((item) => (
                    <tr key={item.id}>
                      <td>{item.name}</td>
                      <td>{item.academic_year}</td>
                      <td>{item.semester_no}</td>
                      <td>{item.start_date}</td>
                      <td>{item.end_date}</td>
                      <td>{renderStatusLabel(item.status)}</td>
                      <td className="actions">
                        {canManage ? (
                          <>
                            <button type="button" className="btn-small btn-info" onClick={() => handleEditTerm(item)}>
                              {commonCopy.edit}
                            </button>
                            <button type="button" className="btn-small btn-danger" onClick={() => handleDeleteTerm(item.id)}>
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

