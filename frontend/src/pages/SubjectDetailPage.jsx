import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { SubjectService } from '../services/studentService';
import { useLanguage } from '../hooks';
import './StudentPage.css';

export const SubjectDetailPage = () => {
  const { subjectId } = useParams();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const copy = t.subjectDetailPage;
  const [data, setData] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchSubjectDetail = async () => {
      setLoading(true);
      try {
        const response = await SubjectService.getSubject(subjectId);
        setData(response.data);
      } catch (error) {
        console.error('Failed to fetch subject details:', error);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjectDetail();
  }, [subjectId]);

  const subject = data?.subject;
  const classSubjects = data?.class_subjects || [];
  const scores = data?.scores || [];

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="subjects" />
        <main className="main-content">
          <section className="content-hero">
            <div>
              <h1>{copy.title}</h1>
              <p>{subject?.name || commonCopy.loading}</p>
            </div>
            <div className="content-hero-actions">
              <Link to="/subjects" className="btn-primary btn-secondary-tone">
                {commonCopy.backToList}
              </Link>
            </div>
          </section>

          {loading ? (
            <div className="form-section">
              <p className="loading">{commonCopy.loading}</p>
            </div>
          ) : !subject ? (
            <div className="form-section">
              <p className="no-data">{copy.notFound}</p>
            </div>
          ) : (
            <>
              <section className="detail-grid">
                <article className="detail-card">
                  <span className="detail-card-label">{copy.summary}</span>
                  <strong>{subject.name}</strong>
                  <p>{copy.subjectCode}: {subject.code}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.credits}</span>
                  <strong>{subject.credits}</strong>
                  <p>{copy.subjectCode}: {subject.code}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.averageScore}</span>
                  <strong>{data?.average_score ?? '-'}</strong>
                  <p>{copy.scoreCount}: {data?.score_count || scores.length}</p>
                </article>
                <article className="detail-card">
                  <span className="detail-card-label">{copy.classSubjects}</span>
                  <strong>{classSubjects.length}</strong>
                  <p>{copy.activeMappings}</p>
                </article>
              </section>

              <section className="form-section">
                <div className="section-heading">
                  <h2>{copy.description}</h2>
                </div>
                <p className="detail-paragraph">{subject.description || '-'}</p>
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
                        <th>{copy.classId}</th>
                        <th>{copy.termId}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classSubjects.map((item) => (
                        <tr key={item.id}>
                          <td>#{item.id}</td>
                          <td>
                            <Link to={`/classes/${item.class_id}`} className="table-inline-link">
                              {item.class_id}
                            </Link>
                          </td>
                          <td>{item.academic_term_id}</td>
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
                  <p className="no-data detail-empty">{commonCopy.noData}</p>
                ) : (
                  <table className="students-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>{copy.scoreType}</th>
                        <th>{copy.score}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {scores.slice(0, 10).map((item) => (
                        <tr key={item.id}>
                          <td>
                            <Link to={`/scores/${item.id}`} className="table-inline-link">
                              #{item.id}
                            </Link>
                          </td>
                          <td>{item.score_type}</td>
                          <td>{item.score}</td>
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

export default SubjectDetailPage;
