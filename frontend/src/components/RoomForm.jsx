import React, { useState } from 'react';
import './StudentForm.css';
import { useLanguage } from '../hooks';

export const RoomForm = ({ onSubmit, initialData = null, isLoading = false }) => {
  const { t } = useLanguage();
  const formCopy = t.roomForm;
  const pageCopy = t.roomsPage;

  const [formData, setFormData] = useState(
    initialData || {
      room_code: '',
      building: '',
      floor_no: '',
      capacity: '',
      room_type: 'classroom'
    }
  );

  const [errors, setErrors] = useState({});

  React.useEffect(() => {
    setFormData(
      initialData || {
        room_code: '',
        building: '',
        floor_no: '',
        capacity: '',
        room_type: 'classroom'
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
    if (!formData.room_code) newErrors.room_code = formCopy.requiredRoomCode;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit({
      ...formData,
      floor_no: formData.floor_no === '' ? null : Number(formData.floor_no),
      capacity: formData.capacity === '' ? null : Number(formData.capacity)
    });
  };

  return (
    <form className="student-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <div className="form-group">
          <label htmlFor="room_code">{formCopy.roomCode} *</label>
          <input
            id="room_code"
            name="room_code"
            value={formData.room_code}
            onChange={handleChange}
            disabled={isLoading || !!initialData}
          />
          {errors.room_code && <span className="error">{errors.room_code}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="building">{formCopy.building}</label>
          <input id="building" name="building" value={formData.building} onChange={handleChange} disabled={isLoading} />
        </div>

        <div className="form-group">
          <label htmlFor="floor_no">{formCopy.floorNo}</label>
          <input
            type="number"
            id="floor_no"
            name="floor_no"
            value={formData.floor_no}
            onChange={handleChange}
            disabled={isLoading}
            min={0}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label htmlFor="capacity">{formCopy.capacity}</label>
          <input
            type="number"
            id="capacity"
            name="capacity"
            value={formData.capacity}
            onChange={handleChange}
            disabled={isLoading}
            min={0}
          />
        </div>

        <div className="form-group">
          <label htmlFor="room_type">{formCopy.roomType}</label>
          <select id="room_type" name="room_type" value={formData.room_type} onChange={handleChange} disabled={isLoading}>
            <option value="classroom">{pageCopy.roomTypeLabels?.classroom ?? 'classroom'}</option>
            <option value="lab">{pageCopy.roomTypeLabels?.lab ?? 'lab'}</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn-submit" disabled={isLoading}>
          {isLoading ? formCopy.saving : initialData ? formCopy.updateRoom : formCopy.saveRoom}
        </button>
      </div>
    </form>
  );
};

export default RoomForm;

