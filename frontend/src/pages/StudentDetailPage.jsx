import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { StudentService } from '../services/studentService';
import { useLanguage } from '../hooks';
import './StudentPage.css';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

export const StudentDetailPage = () => {
  const { studentId } = useParams();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const copy = t.studentDetailPage;
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStudent = async () => {
      setLoading(true);
      try {
        const response = await StudentService.getStudent(studentId);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch student details:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [studentId]);

  const student = data?.student;
  const currentClass = data?.class;
  const enrollments = data?.enrollments || [];
  const scores = data?.scores || [];

  const renderStudentStatus = (value) => {
    const map = {
      Active: t.studentsPage.active,
      Inactive: t.studentsPage.inactive,
      Graduated: t.studentsPage.graduated,
      Suspended: t.studentsPage.suspended
    };
    return map[value] ?? value;
  };

  const renderEnrollmentStatus = (value) => t.enrollmentsPage.statusLabels?.[value] ?? value;

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="students" />
        <main className="main-content">
          <section className="content-hero">
            <div>
              <h1>{copy.title}</h1>
              <p>{student ? `${student.last_name} ${student.first_name}` : commonCopy.loading}</p>
            </div>
            <div className="content-hero-actions">
              <Link to="/students" className="btn-primary btn-secondary-tone">
                {commonCopy.backToList}
              </Link>
            </div>
          </section>

          {loading ? (
            <div className="form-section">
              <p className="loading">{commonCopy.loading}</p>
            </div>
          ) : !student ? (
            <div className="form-section">
              <p className="no-data">{copy.notFound}</p>
            </div>
          ) : (
            <>
              <section className="detail-grid">
                <article className="detail-card">
                  <span className="detail-card-label">{copy.summary}</span>
                  <strong>{student.student_code}</strong>
                  <p>{copy.studentCode}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.classInfo}</span>
                  <strong>{currentClass?.name || '-'}</strong>
                  <p>{currentClass?.academic_year || '-'}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.enrollmentDate}</span>
                  <strong>{formatDate(student.enrollment_date)}</strong>
                  <p>{copy.status}: {renderStudentStatus(student.status)}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.averageScore}</span>
                  <strong>{data?.average_score ?? '-'}</strong>
                  <p>{scores.length} {copy.scoreRecordsSuffix}</p>
                </article>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <h2>{copy.personalInfo}</h2>
                </div>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <span>{copy.fullName}</span>
                    <strong>{student.last_name} {student.first_name}</strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.email}</span>
                    <strong>{student.email}</strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.phone}</span>
                    <strong>{student.phone || '-'}</strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.gender}</span>
                    <strong>{student.gender || '-'}</strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.dateOfBirth}</span>
                    <strong>{formatDate(student.date_of_birth)}</strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.address}</span>
                    <strong>{student.address || '-'}</strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.guardianName}</span>
                    <strong>{student.guardian_name || '-'}</strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.guardianPhone}</span>
                    <strong>{student.guardian_phone || '-'}</strong>
                  </div>
                </div>
              </section>

              <section className="students-table-section detail-section">
                <div className="section-heading detail-section-heading">
                  <h2>{copy.enrollments}</h2>
                </div>
                {enrollments.length === 0 ? (
                  <p className="no-data detail-empty">{copy.emptyEnrollments}</p>
                ) : (
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>{copy.enrollmentId}</th>
                        <th>{copy.classSubjectId}</th>
                        <th>{copy.status}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {enrollments.map((item) => (
                        <tr key={item.id}>
                          <td>#{item.id}</td>
                          <td>#{item.class_subject_id}</td>
                          <td>{renderEnrollmentStatus(item.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </section>

              <section className="students-table-section detail-section">
                <div className="section-heading detail-section-heading">
                  <h2>{copy.scores}</h2>
                </div>
                {scores.length === 0 ? (
                  <p className="no-data detail-empty">{copy.emptyScores}</p>
                ) : (
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{copy.scoreType}</th>
                        <th>{copy.score}</th>
                        <th>{copy.examDate}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.map((item) => (
                        <tr key={item.id}>
                          <td>
                            <Link to={`/scores/${item.id}`} className="table-inline-link">
                              #{item.id}
                            </Link>
                          </td>
                          <td>{item.score_type}</td>
                          <td>{item.score}</td>
                          <td>{formatDate(item.exam_date)}</td>
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

export default StudentDetailPage;
