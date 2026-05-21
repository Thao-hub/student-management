import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { EnrollmentService, ScoreService, StudentService } from '../services/studentService';
import { useLanguage } from '../hooks';
import './StudentPage.css';

const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '-');

export const ScoreDetailPage = () => {
  const { scoreId } = useParams();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const copy = t.scoreDetailPage;
  const [score, setScore] = React.useState(null);
  const [enrollment, setEnrollment] = React.useState(null);
  const [studentDetail, setStudentDetail] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchScoreDetail = async () => {
      setLoading(true);
      try {
        const scoreResponse = await ScoreService.getScore(scoreId);
        const scoreData = scoreResponse.data;
        setScore(scoreData);

        const enrollmentResponse = await EnrollmentService.getEnrollment(scoreData.enrollment_id);
        setEnrollment(enrollmentResponse.data);

        const studentResponse = await StudentService.getStudent(enrollmentResponse.data.student_id);
        setStudentDetail(studentResponse.data);
      } catch (error) {
        console.error('Failed to fetch score details:', error);
        setScore(null);
        setEnrollment(null);
        setStudentDetail(null);
      } finally {
        setLoading(false);
      }
    };

    fetchScoreDetail();
  }, [scoreId]);

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="scores" />
        <main className="main-content">
          <section className="content-hero">
            <div>
              <h1>{copy.title}</h1>
              <p>{score ? `#${score.id}` : commonCopy.loading}</p>
            </div>
            <div className="content-hero-actions">
              <Link to="/scores" className="btn-primary btn-secondary-tone">
                {commonCopy.backToList}
              </Link>
            </div>
          </section>

          {loading ? (
            <div className="form-section">
              <p className="loading">{commonCopy.loading}</p>
            </div>
          ) : !score ? (
            <div className="form-section">
              <p className="no-data">{copy.notFound}</p>
            </div>
          ) : (
            <>
              <section className="detail-grid">
                <article className="detail-card">
                  <span className="detail-card-label">{copy.summary}</span>
                  <strong>{score.score}</strong>
                  <p>{copy.scoreType}: {score.score_type}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.maxScore}</span>
                  <strong>{score.max_score}</strong>
                  <p>{copy.weight}: {score.weight}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.grade}</span>
                  <strong>{score.grade || '-'}</strong>
                  <p>{copy.examDate}: {formatDate(score.exam_date)}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.enrollment}</span>
                  <strong>#{score.enrollment_id}</strong>
                  <p>{copy.classSubjectId}: {enrollment?.class_subject_id || '-'}</p>
                </article>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <h2>{copy.enrollment}</h2>
                </div>
                <div className="detail-info-grid">
                  <div className="detail-info-item">
                    <span>{copy.enrollmentId}</span>
                    <strong>{enrollment ? `#${enrollment.id}` : '-'}</strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.student}</span>
                    <strong>
                      {studentDetail?.student ? (
                        <Link to={`/students/${studentDetail.student.id}`} className="table-inline-link">
                          {studentDetail.student.last_name} {studentDetail.student.first_name}
                        </Link>
                      ) : '-'}
                    </strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.studentId}</span>
                    <strong>{enrollment?.student_id || '-'}</strong>
                  </div>
                  <div className="detail-info-item">
                    <span>{copy.classSubjectId}</span>
                    <strong>{enrollment?.class_subject_id || '-'}</strong>
                  </div>
                  <div className="detail-info-item detail-info-item-wide">
                    <span>{copy.remarks}</span>
                    <strong>{score.remarks || '-'}</strong>
                  </div>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ScoreDetailPage;
