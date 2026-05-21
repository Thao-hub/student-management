import React, { useState } from 'react';
import './StudentForm.css';
import { useLanguage } from '../hooks';

const getInitialFormData = (initialData) => ({
  student_id: initialData?.student_id ? String(initialData.student_id) : '',
  class_subject_id: initialData?.class_subject_id ? String(initialData.class_subject_id) : '',
  status: initialData?.status || 'enrolled',
  notes: initialData?.notes || ''
});

export const EnrollmentForm = ({
  onSubmit,
  initialData = null,
  isLoading = false,
  students = [],
  classSubjects = []
}) => {
  const { t } = useLanguage();
  const formCopy = t.enrollmentForm;
  const pageCopy = t.enrollmentsPage;

  const [formData, setFormData] = useState(getInitialFormData(initialData));

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setFormData(getInitialFormData(initialData));
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.student_id) newErrors.student_id = formCopy.requiredStudentId;
    if (!formData.class_subject_id) newErrors.class_subject_id = formCopy.requiredClassSubjectId;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      student_id: Number(formData.student_id),
      class_subject_id: Number(formData.class_subject_id),
      status: formData.status,
      notes: formData.notes || null
    });
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="student_id">{formCopy.studentId} *</label>
          <select
            id="student_id"
            name="student_id"
            value={formData.student_id}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">{formCopy.studentId}</option>
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.student_code} - {student.last_name} {student.first_name}
              </option>
            ))}
          </select>
          {errors.student_id && <span className="error">{errors.student_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="class_subject_id">{formCopy.classSubjectId} *</label>
          <select
            id="class_subject_id"
            name="class_subject_id"
            value={formData.class_subject_id}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="">{formCopy.classSubjectId}</option>
            {classSubjects.map((item) => (
              <option key={item.id} value={item.id}>
                #{item.id} - {item.class_name} / {item.subject_name} / {item.term_name}
              </option>
            ))}
          </select>
          {errors.class_subject_id && <span className="error">{errors.class_subject_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">{formCopy.status}</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} disabled={isLoading}>
            <option value="enrolled">{pageCopy.statusLabels?.enrolled ?? 'enrolled'}</option>
            <option value="dropped">{pageCopy.statusLabels?.dropped ?? 'dropped'}</option>
            <option value="completed">{pageCopy.statusLabels?.completed ?? 'completed'}</option>
            <option value="failed">{pageCopy.statusLabels?.failed ?? 'failed'}</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">{formCopy.notes}</label>
        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} disabled={isLoading} rows={3} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? formCopy.saving : initialData ? formCopy.updateEnrollment : formCopy.saveEnrollment}
        </button>
      </div>
    </form>
  );
};

export default EnrollmentForm;
