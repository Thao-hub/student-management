import React, { useState } from 'react';
import './StudentForm.css';
import { useLanguage } from '../hooks';

export const AcademicTermForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const { t } = useLanguage();
  const formCopy = t.termForm;
  const pageCopy = t.termsPage;

  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      academic_year: '',
      semester_no: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
      status: 'du_kien'
    }
  );

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setFormData(
      initialData || {
        name: '',
        academic_year: '',
        semester_no: 1,
        start_date: new Date().toISOString().split('T')[0],
        end_date: new Date().toISOString().split('T')[0],
        status: 'du_kien'
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
    if (!formData.name) newErrors.name = formCopy.requiredName;
    if (!formData.academic_year) newErrors.academic_year = formCopy.requiredAcademicYear;
    if (!formData.start_date) newErrors.start_date = formCopy.requiredStartDate;
    if (!formData.end_date) newErrors.end_date = formCopy.requiredEndDate;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit({
      ...formData,
      semester_no: Number(formData.semester_no)
    });
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="name">{formCopy.name} *</label>
          <input id="name" name="name" value={formData.name} onChange={handleChange} disabled={isLoading} />
          {errors.name && <span className="error">{errors.name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="academic_year">{formCopy.academicYear} *</label>
          <input
            id="academic_year"
            name="academic_year"
            value={formData.academic_year}
            onChange={handleChange}
            disabled={isLoading}
            placeholder="2024-2025"
          />
          {errors.academic_year && <span className="error">{errors.academic_year}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="semester_no">{formCopy.semesterNo}</label>
          <input
            type="number"
            id="semester_no"
            name="semester_no"
            value={formData.semester_no}
            onChange={handleChange}
            disabled={isLoading}
            min={1}
            max={3}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="start_date">{formCopy.startDate} *</label>
          <input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.start_date && <span className="error">{errors.start_date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="end_date">{formCopy.endDate} *</label>
          <input
            type="date"
            id="end_date"
            name="end_date"
            value={formData.end_date}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.end_date && <span className="error">{errors.end_date}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="status">{formCopy.status}</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange} disabled={isLoading}>
            <option value="du_kien">{pageCopy.statusLabels?.du_kien ?? 'du_kien'}</option>
            <option value="dang_dien_ra">{pageCopy.statusLabels?.dang_dien_ra ?? 'dang_dien_ra'}</option>
            <option value="da_ket_thuc">{pageCopy.statusLabels?.da_ket_thuc ?? 'da_ket_thuc'}</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? formCopy.saving : initialData ? formCopy.updateTerm : formCopy.saveTerm}
        </button>
      </div>
    </form>
  );
};

export default AcademicTermForm;

