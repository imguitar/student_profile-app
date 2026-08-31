import { useCallback, useEffect, useMemo, useState } from 'react';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '/api').replace(/\/+$/, '');

function apiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

const emptyForm = {
  student_code: '',
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  faculty: '',
  major: '',
  year_level: '1',
  gpa: '0.00',
  date_of_birth: '',
};

const facultyOptions = [
  'วิศวกรรมศาสตร์',
  'วิทยาศาสตร์',
  'บริหารธุรกิจ',
  'มนุษยศาสตร์',
  'ศึกษาศาสตร์',
  'นิติศาสตร์',
  'แพทยศาสตร์',
];

async function request(url, options) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (response.status === 204) return null;
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new Error(data.message || 'ไม่สามารถเชื่อมต่อระบบได้');
  if (data === null) {
    throw new Error('API ส่งข้อมูลกลับมาในรูปแบบไม่ถูกต้อง กรุณาตรวจสอบ VITE_API_URL');
  }
  return data;
}

function StudentForm({ form, editingId, busy, onChange, onSubmit, onCancel }) {
  return (
    <form className="student-form" onSubmit={onSubmit}>
      <div className="form-heading">
        <div>
          <span className="eyebrow">STUDENT PROFILE</span>
          <h2>{editingId ? 'แก้ไขข้อมูลนักศึกษา' : 'เพิ่มนักศึกษาใหม่'}</h2>
        </div>
        {editingId && <span className="edit-badge">กำลังแก้ไข</span>}
      </div>

      <div className="form-grid">
        <label>
          รหัสนักศึกษา <em>*</em>
          <input name="student_code" value={form.student_code} onChange={onChange} placeholder="เช่น 68010001" required />
        </label>
        <label>
          อีเมลมหาวิทยาลัย <em>*</em>
          <input name="email" type="email" value={form.email} onChange={onChange} placeholder="student@example.ac.th" required />
        </label>
        <label>
          ชื่อ <em>*</em>
          <input name="first_name" value={form.first_name} onChange={onChange} required />
        </label>
        <label>
          นามสกุล <em>*</em>
          <input name="last_name" value={form.last_name} onChange={onChange} required />
        </label>
        <label>
          คณะ <em>*</em>
          <input name="faculty" list="faculties" value={form.faculty} onChange={onChange} required />
          <datalist id="faculties">
            {facultyOptions.map((faculty) => <option key={faculty} value={faculty} />)}
          </datalist>
        </label>
        <label>
          สาขาวิชา <em>*</em>
          <input name="major" value={form.major} onChange={onChange} required />
        </label>
        <label>
          ชั้นปี <em>*</em>
          <select name="year_level" value={form.year_level} onChange={onChange}>
            {Array.from({ length: 8 }, (_, index) => index + 1).map((year) => (
              <option key={year} value={year}>ชั้นปีที่ {year}</option>
            ))}
          </select>
        </label>
        <label>
          GPA <em>*</em>
          <input name="gpa" type="number" min="0" max="4" step="0.01" value={form.gpa} onChange={onChange} required />
        </label>
        <label>
          เบอร์โทรศัพท์
          <input name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="08xxxxxxxx" />
        </label>
        <label>
          วันเกิด
          <input name="date_of_birth" type="date" value={form.date_of_birth || ''} onChange={onChange} />
        </label>
      </div>

      <div className="form-actions">
        {editingId && <button type="button" className="button ghost" onClick={onCancel}>ยกเลิก</button>}
        <button type="submit" className="button primary" disabled={busy}>
          {busy ? 'กำลังบันทึก...' : editingId ? 'บันทึกการแก้ไข' : '+ เพิ่มนักศึกษา'}
        </button>
      </div>
    </form>
  );
}

function StudentTable({ students, loading, onEdit, onDelete }) {
  if (loading) return <div className="state-card"><span className="spinner" />กำลังโหลดข้อมูล...</div>;
  if (!students.length) return <div className="state-card"><span className="empty-icon">⌕</span>ไม่พบข้อมูลนักศึกษา</div>;

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>นักศึกษา</th>
            <th>คณะ / สาขา</th>
            <th>ชั้นปี</th>
            <th>GPA</th>
            <th>ติดต่อ</th>
            <th aria-label="การจัดการ" />
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student.id}>
              <td data-label="นักศึกษา">
                <div className="student-cell">
                  <span className="avatar">{student.first_name.charAt(0)}</span>
                  <div><strong>{student.first_name} {student.last_name}</strong><small>{student.student_code}</small></div>
                </div>
              </td>
              <td data-label="คณะ / สาขา"><strong>{student.faculty}</strong><small>{student.major}</small></td>
              <td data-label="ชั้นปี"><span className="year-pill">ปี {student.year_level}</span></td>
              <td data-label="GPA"><span className={`gpa ${student.gpa >= 3.5 ? 'high' : ''}`}>{Number(student.gpa).toFixed(2)}</span></td>
              <td data-label="ติดต่อ"><strong>{student.email}</strong><small>{student.phone || '—'}</small></td>
              <td className="row-actions">
                <button className="icon-button" onClick={() => onEdit(student)} title="แก้ไข">✎</button>
                <button className="icon-button danger" onClick={() => onDelete(student)} title="ลบ">×</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function App() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState(null);

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request(apiUrl('/students'));
      if (!Array.isArray(data)) {
        throw new Error('ข้อมูลนักศึกษาจาก API ไม่ใช่รายการ กรุณาตรวจสอบ VITE_API_URL');
      }
      setStudents(data);
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStudents(); }, [loadStudents]);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(null), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return students;
    return students.filter((student) => Object.values(student).some(
      (value) => String(value ?? '').toLowerCase().includes(keyword),
    ));
  }, [search, students]);

  const stats = useMemo(() => ({
    total: students.length,
    faculties: new Set(students.map((student) => student.faculty)).size,
    averageGpa: students.length
      ? (students.reduce((sum, student) => sum + Number(student.gpa), 0) / students.length).toFixed(2)
      : '0.00',
  }), [students]);

  function handleChange(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function handleEdit(student) {
    setEditingId(student.id);
    setForm(Object.fromEntries(Object.keys(emptyForm).map((key) => [key, student[key] ?? ''])));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = { ...form, year_level: Number(form.year_level), gpa: Number(form.gpa) };
      await request(editingId ? apiUrl(`/students/${editingId}`) : apiUrl('/students'), {
        method: editingId ? 'PUT' : 'POST',
        body: JSON.stringify(payload),
      });
      setNotice({ type: 'success', text: editingId ? 'แก้ไขข้อมูลเรียบร้อยแล้ว' : 'เพิ่มนักศึกษาเรียบร้อยแล้ว' });
      resetForm();
      await loadStudents();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(student) {
    if (!window.confirm(`ต้องการลบข้อมูลของ ${student.first_name} ${student.last_name} ใช่หรือไม่?`)) return;
    try {
      await request(apiUrl(`/students/${student.id}`), { method: 'DELETE' });
      if (editingId === student.id) resetForm();
      setNotice({ type: 'success', text: 'ลบข้อมูลเรียบร้อยแล้ว' });
      await loadStudents();
    } catch (error) {
      setNotice({ type: 'error', text: error.message });
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top"><span className="brand-mark">U</span><span>UNI<span>PROFILE</span></span></a>
        <div className="system-status"><span /> ระบบพร้อมใช้งาน</div>
      </header>

      <main id="top">
        <section className="hero">
          <div>
            <span className="eyebrow light">UNIVERSITY DATA CENTER</span>
            <h1>ระบบจัดการ<br /><em>ข้อมูลนักศึกษา</em></h1>
            <p>จัดเก็บ ค้นหา และดูแลประวัตินักศึกษาของมหาวิทยาลัยไว้ในที่เดียว</p>
          </div>
          <div className="stats">
            <div><span>นักศึกษาทั้งหมด</span><strong>{stats.total}</strong><small>คนในระบบ</small></div>
            <div><span>คณะที่ลงทะเบียน</span><strong>{stats.faculties}</strong><small>คณะ</small></div>
            <div><span>GPA เฉลี่ย</span><strong>{stats.averageGpa}</strong><small>จาก 4.00</small></div>
          </div>
        </section>

        <section className="content-grid">
          <StudentForm form={form} editingId={editingId} busy={busy} onChange={handleChange} onSubmit={handleSubmit} onCancel={resetForm} />

          <div className="list-panel">
            <div className="list-heading">
              <div><span className="eyebrow">STUDENT DIRECTORY</span><h2>รายชื่อนักศึกษา</h2></div>
              <label className="search"><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="ค้นหาชื่อ รหัส คณะ หรือสาขา..." /></label>
            </div>
            <StudentTable students={filteredStudents} loading={loading} onEdit={handleEdit} onDelete={handleDelete} />
            {!loading && <div className="result-count">แสดง {filteredStudents.length} จาก {students.length} รายการ</div>}
          </div>
        </section>
      </main>

      <footer>UNI PROFILE · ระบบตัวอย่างสำหรับจัดการข้อมูลนักศึกษา</footer>
      {notice && <div className={`toast ${notice.type}`}>{notice.type === 'success' ? '✓' : '!'} {notice.text}</div>}
    </div>
  );
}
