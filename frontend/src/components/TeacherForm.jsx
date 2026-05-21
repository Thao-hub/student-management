import React, { useState } from 'react';
import './StudentForm.css';
import { useLanguage } from '../hooks';

export const TeacherForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const { t } = useLanguage();
  const formCopy = t.teacherForm;

  const [formData, setFormData] = useState(
    initialData || {
      ma_giao_vien: '',
      ho: '',
      ten: '',
      email: '',
      so_dien_thoai: '',
      trinh_do: '',
      ngay_vao_lam: ''
    }
  );

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setFormData(
      initialData || {
        ma_giao_vien: '',
        ho: '',
        ten: '',
        email: '',
        so_dien_thoai: '',
        trinh_do: '',
        ngay_vao_lam: ''
      }
    );
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.ma_giao_vien) newErrors.ma_giao_vien = formCopy.requiredTeacherCode;
    if (!formData.ho) newErrors.ho = formCopy.requiredLastName;
    if (!formData.ten) newErrors.ten = formCopy.requiredFirstName;
    if (!formData.email) newErrors.email = formCopy.requiredEmail;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="ma_giao_vien">{formCopy.teacherCode} *</label>
          <input
            type="text"
            id="ma_giao_vien"
            name="ma_giao_vien"
            value={formData.ma_giao_vien}
            onChange={handleChange}
            disabled={isLoading || !!initialData}
          />
          {errors.ma_giao_vien && <span className="error">{errors.ma_giao_vien}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ho">{formCopy.lastName} *</label>
          <input type="text" id="ho" name="ho" value={formData.ho} onChange={handleChange} disabled={isLoading} />
          {errors.ho && <span className="error">{errors.ho}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="ten">{formCopy.firstName} *</label>
          <input type="text" id="ten" name="ten" value={formData.ten} onChange={handleChange} disabled={isLoading} />
          {errors.ten && <span className="error">{errors.ten}</span>}
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="email">{formCopy.email} *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={isLoading || !!initialData}
          />
          {errors.email && <span className="error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="so_dien_thoai">{formCopy.phone}</label>
          <input
            type="tel"
            id="so_dien_thoai"
            name="so_dien_thoai"
            value={formData.so_dien_thoai}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="trinh_do">{formCopy.qualification}</label>
          <input
            type="text"
            id="trinh_do"
            name="trinh_do"
            value={formData.trinh_do}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="ngay_vao_lam">{formCopy.hireDate}</label>
          <input
            type="date"
            id="ngay_vao_lam"
            name="ngay_vao_lam"
            value={formData.ngay_vao_lam}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? formCopy.saving : initialData ? formCopy.updateTeacher : formCopy.saveTeacher}
        </button>
      </div>
    </form>
  );
};

export default TeacherForm;

