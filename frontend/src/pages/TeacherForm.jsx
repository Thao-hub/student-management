import { useState, useEffect } from "react";
import { createTeacher, getTeacherById, updateTeacher } from "../services/teacherService";
import { useNavigate, useParams } from "react-router-dom";

export default function TeacherForm() {
  const [form, setForm] = useState({
    ma_giao_vien: "",
    ho: "",
    ten: "",
    email: "",
    so_dien_thoai: "",
    trinh_do: "",
    ngay_vao_lam: ""
  });

  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    if (id) {
      getTeacherById(id).then(res => setForm(res.data));
    }
  }, [id]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (id) {
      await updateTeacher(id, form);
    } else {
      await createTeacher(form);
    }

    navigate("/teachers");
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>{id ? "Sửa" : "Thêm"} giáo viên</h2>

      <input name="ma_giao_vien" placeholder="Mã GV" value={form.ma_giao_vien} onChange={handleChange} />
      <input name="ho" placeholder="Họ" value={form.ho} onChange={handleChange} />
      <input name="ten" placeholder="Tên" value={form.ten} onChange={handleChange} />
      <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
      <input name="so_dien_thoai" placeholder="SĐT" value={form.so_dien_thoai} onChange={handleChange} />
      <input name="trinh_do" placeholder="Trình độ" value={form.trinh_do} onChange={handleChange} />
      <input type="date" name="ngay_vao_lam" value={form.ngay_vao_lam} onChange={handleChange} />

      <button type="submit">Lưu</button>
    </form>
  );
}
