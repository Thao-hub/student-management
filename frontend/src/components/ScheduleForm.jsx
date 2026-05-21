import React, { useState } from 'react';
import './StudentForm.css';
import { useLanguage } from '../hooks';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const ScheduleForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const { t } = useLanguage();
  const formCopy = t.scheduleForm;
  const pageCopy = t.schedulePage;

  const [formData, setFormData] = useState(
    initialData || {
      class_subject_id: '',
      teacher_id: '',
      room_id: '',
      day_of_week: 'Monday',
      start_time: '07:00',
      end_time: '08:00',
      lesson_no: '',
      is_active: true
    }
  );

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setFormData(
      initialData || {
        class_subject_id: '',
        teacher_id: '',
        room_id: '',
        day_of_week: 'Monday',
        start_time: '07:00',
        end_time: '08:00',
        lesson_no: '',
        is_active: true
      }
    );
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.class_subject_id) newErrors.class_subject_id = formCopy.requiredClassSubjectId;
    if (!formData.teacher_id) newErrors.teacher_id = formCopy.requiredTeacherId;
    if (!formData.start_time) newErrors.start_time = formCopy.requiredStartTime;
    if (!formData.end_time) newErrors.end_time = formCopy.requiredEndTime;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    await onSubmit({
      class_subject_id: Number(formData.class_subject_id),
      teacher_id: Number(formData.teacher_id),
      room_id: formData.room_id === '' ? null : Number(formData.room_id),
      day_of_week: formData.day_of_week,
      start_time: formData.start_time,
      end_time: formData.end_time,
      lesson_no: formData.lesson_no === '' ? null : Number(formData.lesson_no),
      is_active: Boolean(formData.is_active)
    });
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="form-row">
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

        <div className="form-group">
          <label htmlFor="teacher_id">{formCopy.teacherId} *</label>
          <input
            type="number"
            id="teacher_id"
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            disabled={isLoading}
            min={1}
          />
          {errors.teacher_id && <span className="error">{errors.teacher_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="room_id">{formCopy.roomId}</label>
          <input
            type="number"
            id="room_id"
            name="room_id"
            value={formData.room_id}
            onChange={handleChange}
            disabled={isLoading}
            min={1}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="day_of_week">{formCopy.dayOfWeek}</label>
          <select id="day_of_week" name="day_of_week" value={formData.day_of_week} onChange={handleChange} disabled={isLoading}>
            {DAYS.map((day) => (
              <option key={day} value={day}>
                {pageCopy.days?.[day] ?? day}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="start_time">{formCopy.startTime} *</label>
          <input
            type="time"
            id="start_time"
            name="start_time"
            value={formData.start_time}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.start_time && <span className="error">{errors.start_time}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="end_time">{formCopy.endTime} *</label>
          <input type="time" id="end_time" name="end_time" value={formData.end_time} onChange={handleChange} disabled={isLoading} />
          {errors.end_time && <span className="error">{errors.end_time}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="lesson_no">{formCopy.lessonNo}</label>
          <input type="number" id="lesson_no" name="lesson_no" value={formData.lesson_no} onChange={handleChange} disabled={isLoading} min={1} />
        </div>

        <div className="form-group">
          <label htmlFor="is_active">{formCopy.isActive}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, height: 44 }}>
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={!!formData.is_active}
              onChange={handleChange}
              disabled={isLoading}
            />
            <span>{formData.is_active ? t.common.yes : t.common.no}</span>
          </div>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? formCopy.saving : initialData ? formCopy.updateSchedule : formCopy.saveSchedule}
        </button>
      </div>
    </form>
  );
};

export default ScheduleForm;

