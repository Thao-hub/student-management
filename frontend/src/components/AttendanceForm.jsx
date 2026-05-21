import React, { useState } from 'react';
import './StudentForm.css';
import { useLanguage } from '../hooks';

export const AttendanceForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const { t } = useLanguage();
  const formCopy = t.attendanceForm;
  const pageCopy = t.attendancePage;

  const [formData, setFormData] = useState(
    initialData || {
      enrollment_id: '',
      class_schedule_id: '',
      class_subject_id: '',
      attendance_date: new Date().toISOString().split('T')[0],
      status: 'Present',
      notes: ''
    }
  );

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setFormData(
      initialData || {
        enrollment_id: '',
        class_schedule_id: '',
        class_subject_id: '',
        attendance_date: new Date().toISOString().split('T')[0],
        status: 'Present',
        notes: ''
      }
    );
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.enrollment_id) newErrors.enrollment_id = formCopy.requiredEnrollmentId;
    if (!formData.class_schedule_id) newErrors.class_schedule_id = formCopy.requiredScheduleId;
    if (!formData.class_subject_id) newErrors.class_subject_id = formCopy.requiredClassSubjectId;
    if (!formData.attendance_date) newErrors.attendance_date = formCopy.requiredDate;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      enrollment_id: Number(formData.enrollment_id),
      class_schedule_id: Number(formData.class_schedule_id),
      class_subject_id: Number(formData.class_subject_id),
      attendance_date: formData.attendance_date,
      status: formData.status,
      notes: formData.notes || null
    });
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="enrollment_id">{formCopy.enrollmentId} *</label>
          <input
            type="number"
            id="enrollment_id"
            name="enrollment_id"
            value={formData.enrollment_id}
            onChange={handleChange}
            disabled={isLoading}
            min={1}
          />
          {errors.enrollment_id && <span className="error">{errors.enrollment_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="class_schedule_id">{formCopy.scheduleId} *</label>
          <input
            type="number"
            id="class_schedule_id"
            name="class_schedule_id"
            value={formData.class_schedule_id}
            onChange={handleChange}
            disabled={isLoading}
            min={1}
          />
          {errors.class_schedule_id && <span className="error">{errors.class_schedule_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="class_subject_id">{formCopy.classSubjectId} *</label>
          <input
            type="number"
            id="class_subject_id"
            name="class_subject_id"
            value={formData.class_subject_id}
            onChange={handleChange}
            disabled={isLoading}
            min={1}
          />
          {errors.class_subject_id && <span className="error">{errors.class_subject_id}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="attendance_date">{formCopy.date} *</label>
          <input
            type="date"
            id="attendance_date"
            name="attendance_date"
            value={formData.attendance_date}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.attendance_date && <span className="error">{errors.attendance_date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">{formCopy.status}</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} disabled={isLoading}>
            <option value="Present">{pageCopy.statusLabels?.Present ?? 'Present'}</option>
            <option value="Absent">{pageCopy.statusLabels?.Absent ?? 'Absent'}</option>
            <option value="Late">{pageCopy.statusLabels?.Late ?? 'Late'}</option>
            <option value="Excused">{pageCopy.statusLabels?.Excused ?? 'Excused'}</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="notes">{formCopy.notes}</label>
        <textarea id="notes" name="notes" value={formData.notes} onChange={handleChange} disabled={isLoading} rows={3} />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? formCopy.saving : initialData ? formCopy.updateAttendance : formCopy.saveAttendance}
        </button>
      </div>
    </form>
  );
};

export default AttendanceForm;

