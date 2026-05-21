import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { ClassService } from '../services/studentService';
import { useLanguage } from '../hooks';
import './StudentPage.css';

export const ClassDetailPage = () => {
  const { classId } = useParams();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const copy = t.classDetailPage;
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchClassDetail = async () => {
      setLoading(true);
      try {
        const response = await ClassService.getClass(classId);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch class details:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchClassDetail();
  }, [classId]);

  const classItem = data?.class;
  const students = data?.students || [];
  const classSubjects = data?.class_subjects || [];

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="classes" />
        <main className="main-content">
          <section className="content-hero">
            <div>
              <h1>{copy.title}</h1>
              <p>{classItem?.name || commonCopy.loading}</p>
            </div>
            <div className="content-hero-actions">
              <Link to="/classes" className="btn-primary btn-secondary-tone">
                {commonCopy.backToList}
              </Link>
            </div>
          </section>

          {loading ? (
            <div className="form-section">
              <p className="loading">{commonCopy.loading}</p>
            </div>
          ) : !classItem ? (
            <div className="form-section">
              <p className="no-data">{copy.notFound}</p>
            </div>
          ) : (
            <>
              <section className="detail-grid">
                <article className="detail-card">
                  <span className="detail-card-label">{copy.overview}</span>
                  <strong>{classItem.name}</strong>
                  <p>{copy.gradeLevel}: {classItem.grade_level || '-'}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.academicYear}</span>
                  <strong>{classItem.academic_year || '-'}</strong>
                  <p>{copy.capacity}: {classItem.capacity || '-'}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.studentCount}</span>
                  <strong>{data?.student_count || students.length}</strong>
                  <p>{copy.activeRecords}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.classSubjects}</span>
                  <strong>{classSubjects.length}</strong>
                  <p>{copy.subjectAssignments}</p>
                </article>
              </section>

              <section className="students-table-section detail-section">
                <div className="section-heading detail-section-heading">
                  <h2>{copy.students}</h2>
                </div>
                {students.length === 0 ? (
                  <p className="no-data detail-empty">{commonCopy.noData}</p>
                ) : (
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>{copy.studentCode}</th>
                        <th>{copy.fullName}</th>
                        <th>{copy.email}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <Link to={`/students/${item.id}`} className="table-inline-link">
                              {item.student_code}
                            </Link>
                          </td>
                          <td>{item.last_name} {item.first_name}</td>
                          <td>{item.email}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section className="students-table-section detail-section">
                <div className="section-heading detail-section-heading">
                  <h2>{copy.classSubjects}</h2>
                </div>
                {classSubjects.length === 0 ? (
                  <p className="no-data detail-empty">{commonCopy.noData}</p>
                ) : (
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>{copy.classSubjectId}</th>
                        <th>{copy.subjectId}</th>
                        <th>{copy.termId}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classSubjects.map((item) => (
                        <tr key={item.id}>
                          <td>#{item.id}</td>
                          <td>{item.subject_id}</td>
                          <td>{item.academic_term_id}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ClassDetailPage;
