import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import { EnrollmentService, ScoreService } from '../services/studentService';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import './StudentPage.css';

const EMPTY_SCORE = {
  enrollment_id: '',
  score_type: 'Quiz',
  score: '',
  max_score: 10,
  weight: 1,
  exam_date: '',
  remarks: ''
};

export const ScorePage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const pageCopy = t.scoresPage;
  const commonCopy = t.common;
  const detailsLabel = commonCopy.details;
  const [scores, setScores] = React.useState([]);
  const [enrollments, setEnrollments] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [editingScore, setEditingScore] = React.useState(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [formData, setFormData] = React.useState(EMPTY_SCORE);
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const fetchData = async () => {
    setLoading(true);
    try {
      const [scoreResponse, enrollmentResponse] = await Promise.all([
        ScoreService.getScores(),
        EnrollmentService.getEnrollments()
      ]);
      setScores(scoreResponse.data);
      setEnrollments(enrollmentResponse.data);
    } catch (error) {
      console.error('Failed to fetch scores:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, []);

  React.useEffect(() => {
    setFormData(
      editingScore
        ? {
            enrollment_id: editingScore.enrollment_id,
            score_type: editingScore.score_type,
            score: editingScore.score,
            max_score: editingScore.max_score,
            weight: editingScore.weight,
            exam_date: editingScore.exam_date || '',
            remarks: editingScore.remarks || ''
          }
        : EMPTY_SCORE
    );
  }, [editingScore]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const payload = {
        enrollment_id: Number(formData.enrollment_id),
        score_type: formData.score_type,
        score: Number(formData.score),
        max_score: Number(formData.max_score),
        weight: Number(formData.weight),
        exam_date: formData.exam_date || null,
        remarks: formData.remarks || null
      };
      if (editingScore) {
        await ScoreService.updateScore(editingScore.id, payload);
      } else {
        await ScoreService.createScore(payload);
      }
      setEditingScore(null);
      setShowForm(false);
      await fetchData();
    } catch (error) {
      console.error('Failed to save score:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (scoreId) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    if (!window.confirm(pageCopy.confirmDelete)) return;
    try {
      await ScoreService.deleteScore(scoreId);
      await fetchData();
    } catch (error) {
      console.error('Failed to delete score:', error);
    }
  };

  const filteredScores = scores.filter((item) =>
    `${item.enrollment_id} ${item.score_type}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderEnrollmentLabel = (item) => `#${item.id} - ${pageCopy.enrollmentId} ${item.id}`;

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="scores" />
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
                    'scores.csv',
                    filteredScores.map((item) => ({
                      enrollment_id: item.enrollment_id,
                      score_type: item.score_type,
                      score: item.score,
                      max_score: item.max_score,
                      weight: item.weight,
                      grade: item.grade || '',
                      exam_date: item.exam_date || ''
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
                    setEditingScore(null);
                    setShowForm((prev) => !prev);
                  }}
                >
                  {showForm ? commonCopy.close : pageCopy.addScore}
                </button>
              )}
            </div>
          </section>

          {showForm && canManage && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingScore ? pageCopy.editScore : pageCopy.addScore}</h2>
              </div>
              <form className="compact-form" onSubmit={handleSubmit}>
                <div className="form-grid score-form-grid">
                  <div className="inline-field">
                    <label htmlFor="score-enrollment">{pageCopy.enrollmentId}</label>
                    <select
                      id="score-enrollment"
                      value={formData.enrollment_id}
                      onChange={(e) => setFormData((prev) => ({ ...prev, enrollment_id: e.target.value }))}
                      required
                    >
                      <option value="">{pageCopy.enrollmentId}</option>
                      {enrollments.map((item) => (
                        <option key={item.id} value={item.id}>
                          {renderEnrollmentLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="inline-field">
                    <label htmlFor="score-type">{pageCopy.scoreType}</label>
                    <select
                      id="score-type"
                      value={formData.score_type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, score_type: e.target.value }))}
                    >
                      <option value="Quiz">{pageCopy.quiz}</option>
                      <option value="Assignment">{pageCopy.assignment}</option>
                      <option value="Midterm">{pageCopy.midterm}</option>
                      <option value="Final">{pageCopy.final}</option>
                      <option value="Practice">{pageCopy.practice}</option>
                    </select>
                  </div>

                  <div className="inline-field">
                    <label htmlFor="score-value">{pageCopy.score}</label>
                    <input
                      id="score-value"
                      type="number"
                      step="0.01"
                      value={formData.score}
                      onChange={(e) => setFormData((prev) => ({ ...prev, score: e.target.value }))}
                      placeholder={pageCopy.score}
                      required
                    />
                  </div>

                  <div className="inline-field">
                    <label htmlFor="score-max">{pageCopy.maxScore}</label>
                    <input
                      id="score-max"
                      type="number"
                      step="0.01"
                      value={formData.max_score}
                      onChange={(e) => setFormData((prev) => ({ ...prev, max_score: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="inline-field">
                    <label htmlFor="score-weight">{pageCopy.weight}</label>
                    <input
                      id="score-weight"
                      type="number"
                      step="0.01"
                      value={formData.weight}
                      onChange={(e) => setFormData((prev) => ({ ...prev, weight: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="inline-field">
                    <label htmlFor="score-exam-date">{pageCopy.examDate}</label>
                    <input
                      id="score-exam-date"
                      type="date"
                      value={formData.exam_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, exam_date: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="inline-field inline-field-full">
                  <label htmlFor="score-remarks">{pageCopy.remarks}</label>
                  <textarea
                    id="score-remarks"
                    value={formData.remarks}
                    onChange={(e) => setFormData((prev) => ({ ...prev, remarks: e.target.value }))}
                    placeholder={pageCopy.remarks}
                    rows="3"
                  />
                </div>
                <div className="form-actions">
                  <button type="submit" className="btn-submit" disabled={loading}>
                    {loading ? commonCopy.loading : editingScore ? commonCopy.update : commonCopy.save}
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
              <p className="loading">{pageCopy.loadingScores}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.enrollmentId}</th>
                    <th>{pageCopy.scoreType}</th>
                    <th>{pageCopy.score}</th>
                    <th>{pageCopy.maxScore}</th>
                    <th>{pageCopy.weight}</th>
                    <th>{pageCopy.grade}</th>
                    <th>{pageCopy.examDate}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredScores.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-data">
                        {pageCopy.noScoresFound}
                      </td>
                    </tr>
                  ) : (
                    filteredScores.map((item) => (
                      <tr key={item.id}>
                        <td>#{item.enrollment_id}</td>
                        <td>{item.score_type}</td>
                        <td>{item.score}</td>
                        <td>{item.max_score}</td>
                        <td>{item.weight}</td>
                        <td>{item.grade || '-'}</td>
                        <td>{item.exam_date || '-'}</td>
                        <td className="actions">
                          <Link to={`/scores/${item.id}`} className="btn-small btn-info">
                            {detailsLabel}
                          </Link>
                          {canManage ? (
                            <>
                              <button
                                type="button"
                                className="btn-small btn-info"
                                onClick={() => {
                                  setEditingScore(item);
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
};

export default ScorePage;
