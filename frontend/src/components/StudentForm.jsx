import React, { useState } from 'react';
import './StudentForm.css';
import { useLanguage } from '../hooks';

export const StudentForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const { t } = useLanguage();
  const formCopy = t.studentForm;

  const createEmptyFormData = () => ({
    student_code: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    date_of_birth: '',
    gender: 'Male',
    address: '',
    guardian_name: '',
    guardian_phone: '',
    class_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const normalizeFormData = (data) => ({
    ...createEmptyFormData(),
    ...data,
    phone: data?.phone || '',
    date_of_birth: data?.date_of_birth || '',
    address: data?.address || '',
    guardian_name: data?.guardian_name || '',
    guardian_phone: data?.guardian_phone || '',
    class_id: data?.class_id || '',
    enrollment_date: data?.enrollment_date || new Date().toISOString().split('T')[0],
    status: data?.status || 'Active',
    gender: data?.gender || 'Male'
  });

  const [formData, setFormData] = useState(initialData ? normalizeFormData(initialData) : createEmptyFormData());

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setFormData(initialData ? normalizeFormData(initialData) : createEmptyFormData());
    setErrors({});
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.student_code) newErrors.student_code = formCopy.requiredStudentId;
    if (!formData.first_name) newErrors.first_name = formCopy.requiredFirstName;
    if (!formData.last_name) newErrors.last_name = formCopy.requiredLastName;
    if (!formData.email) newErrors.email = formCopy.requiredEmail;
    if (!formData.class_id) newErrors.class_id = formCopy.requiredClass;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="student_code">{formCopy.studentId} *</label>
          <input
            type="text"
            id="student_code"
            name="student_code"
            value={formData.student_code}
            onChange={handleChange}
            placeholder={formCopy.placeholderStudentId}
            disabled={isLoading || !!initialData}
          />
          {errors.student_code && <span className="error">{errors.student_code}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="first_name">{formCopy.firstName} *</label>
          <input
            type="text"
            id="first_name"
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.first_name && <span className="error">{errors.first_name}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="last_name">{formCopy.lastName} *</label>
          <input
            type="text"
            id="last_name"
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            disabled={isLoading}
          />
          {errors.last_name && <span className="error">{errors.last_name}</span>}
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
          <label htmlFor="phone">{formCopy.phone}</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="date_of_birth">{formCopy.dateOfBirth}</label>
          <input
            type="date"
            id="date_of_birth"
            name="date_of_birth"
            value={formData.date_of_birth}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="gender">{formCopy.gender}</label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="Male">{formCopy.male}</option>
            <option value="Female">{formCopy.female}</option>
            <option value="Other">{formCopy.other}</option>
          </select>
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="address">{formCopy.address}</label>
        <textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleChange}
          disabled={isLoading}
          rows="3"
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="guardian_name">{formCopy.guardianName}</label>
          <input
            type="text"
            id="guardian_name"
            name="guardian_name"
            value={formData.guardian_name}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="guardian_phone">{formCopy.guardianPhone}</label>
          <input
            type="tel"
            id="guardian_phone"
            name="guardian_phone"
            value={formData.guardian_phone}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="class_id">{formCopy.class} *</label>
          <input
            type="number"
            id="class_id"
            name="class_id"
            value={formData.class_id}
            onChange={handleChange}
            placeholder={formCopy.placeholderClassId}
            disabled={isLoading}
          />
          {errors.class_id && <span className="error">{errors.class_id}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="enrollment_date">{formCopy.enrollmentDate}</label>
          <input
            type="date"
            id="enrollment_date"
            name="enrollment_date"
            value={formData.enrollment_date}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">{formCopy.status}</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="Active">{formCopy.active}</option>
            <option value="Inactive">{formCopy.inactive}</option>
            <option value="Graduated">{formCopy.graduated}</option>
            <option value="Suspended">{formCopy.suspended}</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? formCopy.saving : initialData ? formCopy.updateStudent : formCopy.saveStudent}
        </button>
      </div>
    </form>
  );
};

export default StudentForm;
