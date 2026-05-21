import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import EnrollmentForm from '../components/EnrollmentForm';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import {
  AcademicTermService,
  ClassService,
  ClassSubjectService,
  EnrollmentService,
  StudentService,
  SubjectService
} from '../services/studentService';
import './StudentPage.css';

export default function EnrollmentPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const pageCopy = t.enrollmentsPage;
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const { enrollmentId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingEnrollment, setEditingEnrollment] = React.useState(null);
  const [students, setStudents] = React.useState([]);
  const [classSubjects, setClassSubjects] = React.useState([]);

  const studentLabelById = React.useMemo(
    () =>
      new Map(
        students.map((student) => [
          student.id,
          `${student.student_code} - ${student.last_name} ${student.first_name}`
        ])
      ),
    [students]
  );

  const classSubjectLabelById = React.useMemo(
    () =>
      new Map(
        classSubjects.map((item) => [
          item.id,
          `#${item.id} - ${item.class_name} / ${item.subject_name} / ${item.term_name}`
        ])
      ),
    [classSubjects]
  );

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const [enrollmentResponse, studentResponse, classResponse, subjectResponse, termResponse, classSubjectResponse] =
        await Promise.all([
          EnrollmentService.getEnrollments(),
          StudentService.getStudents(),
          ClassService.getClasses(),
          SubjectService.getSubjects(),
          AcademicTermService.getTerms(),
          ClassSubjectService.getClassSubjects()
        ]);

      setEnrollments(enrollmentResponse.data);
      setStudents(studentResponse.data);

      const classes = classResponse.data;
      const subjects = subjectResponse.data;
      const terms = termResponse.data;

      const classNameById = new Map(classes.map((item) => [item.id, item.name]));
      const subjectNameById = new Map(subjects.map((item) => [item.id, item.name]));
      const termNameById = new Map(terms.map((item) => [item.id, item.name]));

      const flattenedClassSubjects = classSubjectResponse.data
        .map((item) => ({
          ...item,
          class_name: classNameById.get(item.class_id) || `Class #${item.class_id}`,
          subject_name: subjectNameById.get(item.subject_id) || `Subject #${item.subject_id}`,
          term_name: termNameById.get(item.academic_term_id) || `Term #${item.academic_term_id}`
        }));

      const uniqueClassSubjects = Array.from(
        new Map(flattenedClassSubjects.map((item) => [item.id, item])).values()
      );

      setClassSubjects(uniqueClassSubjects);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchEnrollments();
  }, []);

  React.useEffect(() => {
    const openCreate = location.pathname.endsWith('/create');
    if (openCreate) {
      setEditingEnrollment(null);
      setShowForm(true);
      return;
    }

    if (enrollmentId) {
      (async () => {
        try {
          const response = await EnrollmentService.getEnrollment(enrollmentId);
          setEditingEnrollment(response.data);
          setShowForm(true);
        } catch (error) {
          console.error('Failed to load enrollment:', error);
          navigate('/enrollments', { replace: true });
        }
      })();
      return;
    }

    setShowForm(false);
    setEditingEnrollment(null);
  }, [enrollmentId, location.pathname, navigate]);

  const filteredEnrollments = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return enrollments;
    return enrollments.filter((item) => {
      const studentLabel = studentLabelById.get(item.student_id) || String(item.student_id);
      const classSubjectLabel = classSubjectLabelById.get(item.class_subject_id) || String(item.class_subject_id);
      const key = `${studentLabel} ${classSubjectLabel} ${item.status} ${item.notes || ''}`.toLowerCase();
      return key.includes(term);
    });
  }, [searchTerm, enrollments, studentLabelById, classSubjectLabelById]);

  const resetForm = () => {
    setShowForm(false);
    setEditingEnrollment(null);
    navigate('/enrollments');
  };

  const handleSaveEnrollment = async (formData) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }

    setLoading(true);
    try {
      if (editingEnrollment) {
        await EnrollmentService.updateEnrollment(editingEnrollment.id, formData);
      } else {
        await EnrollmentService.createEnrollment(formData);
      }
      resetForm();
      await fetchEnrollments();
    } catch (error) {
      console.error('Failed to save enrollment:', error);
      window.alert(error.response?.data?.detail || 'Failed to save enrollment');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEnrollment = (item) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    navigate(`/enrollments/edit/${item.id}`);
  };

  const handleDeleteEnrollment = async (id) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    if (window.confirm(pageCopy.confirmDelete)) {
      try {
        await EnrollmentService.deleteEnrollment(id);
        await fetchEnrollments();
      } catch (error) {
        console.error('Failed to delete enrollment:', error);
      }
    }
  };

  const handleExportCsv = () => {
    exportToCsv(
      'enrollments.csv',
      filteredEnrollments.map((item) => ({
        id: item.id,
        student: studentLabelById.get(item.student_id) || item.student_id,
        class_subject: classSubjectLabelById.get(item.class_subject_id) || item.class_subject_id,
        status: renderStatusLabel(item.status),
        notes: item.notes || ''
      }))
    );
  };

  const renderStatusLabel = (value) => pageCopy.statusLabels?.[value] ?? value;

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="enrollments" />
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
                  onClick={() => navigate(showForm ? '/enrollments' : '/enrollments/create')}
                >
                  {showForm ? commonCopy.close : pageCopy.addEnrollment}
                </button>
              )}
            </div>
          </section>

          {showForm && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingEnrollment ? pageCopy.editEnrollment : pageCopy.addEnrollment}</h2>
              </div>
              <EnrollmentForm
                onSubmit={handleSaveEnrollment}
                initialData={editingEnrollment}
                isLoading={loading}
                students={students}
                classSubjects={classSubjects}
              />
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
            ) : filteredEnrollments.length === 0 ? (
              <p className="no-data">{commonCopy.noData}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.id}</th>
                    <th>{pageCopy.student}</th>
                    <th>{pageCopy.classSubject}</th>
                    <th>{pageCopy.status}</th>
                    <th>{pageCopy.notes}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEnrollments.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>{studentLabelById.get(item.student_id) || item.student_id}</td>
                      <td>{classSubjectLabelById.get(item.class_subject_id) || item.class_subject_id}</td>
                      <td>{renderStatusLabel(item.status)}</td>
                      <td>{item.notes || '-'}</td>
                      <td className="actions">
                        {canManage ? (
                          <>
                            <button type="button" className="btn-small btn-info" onClick={() => handleEditEnrollment(item)}>
                              {commonCopy.edit}
                            </button>
                            <button
                              type="button"
                              className="btn-small btn-danger"
                              onClick={() => handleDeleteEnrollment(item.id)}
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
