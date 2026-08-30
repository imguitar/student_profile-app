import { Router } from 'express';
import pool from '../db.js';

const router = Router();

const selectableColumns = `
  id, student_code, first_name, last_name, email, phone,
  faculty, major, year_level, gpa, date_of_birth, created_at, updated_at
`;

function normalizeStudent(body) {
  return {
    student_code: String(body.student_code ?? '').trim(),
    first_name: String(body.first_name ?? '').trim(),
    last_name: String(body.last_name ?? '').trim(),
    email: String(body.email ?? '').trim().toLowerCase(),
    phone: String(body.phone ?? '').trim() || null,
    faculty: String(body.faculty ?? '').trim(),
    major: String(body.major ?? '').trim(),
    year_level: Number(body.year_level),
    gpa: Number(body.gpa),
    date_of_birth: body.date_of_birth || null,
  };
}

function validateStudent(student) {
  const errors = [];
  const required = ['student_code', 'first_name', 'last_name', 'email', 'faculty', 'major'];

  required.forEach((field) => {
    if (!student[field]) errors.push(`${field} is required`);
  });

  if (student.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(student.email)) {
    errors.push('email is invalid');
  }
  if (!Number.isInteger(student.year_level) || student.year_level < 1 || student.year_level > 8) {
    errors.push('year_level must be an integer between 1 and 8');
  }
  if (!Number.isFinite(student.gpa) || student.gpa < 0 || student.gpa > 4) {
    errors.push('gpa must be between 0 and 4');
  }
  if (student.date_of_birth && !/^\d{4}-\d{2}-\d{2}$/.test(student.date_of_birth)) {
    errors.push('date_of_birth must use YYYY-MM-DD format');
  }

  return errors;
}

function parseId(rawId) {
  const id = Number(rawId);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function handleDatabaseError(error, res, next) {
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'รหัสนักศึกษาหรืออีเมลนี้มีอยู่ในระบบแล้ว' });
  }
  return next(error);
}

router.get('/', async (req, res, next) => {
  try {
    const search = String(req.query.search ?? '').trim();
    let sql = `SELECT ${selectableColumns} FROM students`;
    const params = [];

    if (search) {
      sql += ` WHERE student_code LIKE ? OR first_name LIKE ? OR last_name LIKE ?
               OR email LIKE ? OR faculty LIKE ? OR major LIKE ?`;
      const keyword = `%${search}%`;
      params.push(...Array(6).fill(keyword));
    }

    sql += ' ORDER BY id DESC';
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'รหัสรายการไม่ถูกต้อง' });

  try {
    const [rows] = await pool.query(
      `SELECT ${selectableColumns} FROM students WHERE id = ?`,
      [id],
    );
    if (!rows.length) return res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
    return res.json(rows[0]);
  } catch (error) {
    return next(error);
  }
});

router.post('/', async (req, res, next) => {
  const student = normalizeStudent(req.body);
  const errors = validateStudent(student);
  if (errors.length) return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors });

  try {
    const [result] = await pool.execute(
      `INSERT INTO students
        (student_code, first_name, last_name, email, phone, faculty, major, year_level, gpa, date_of_birth)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      Object.values(student),
    );
    const [rows] = await pool.query(
      `SELECT ${selectableColumns} FROM students WHERE id = ?`,
      [result.insertId],
    );
    return res.status(201).json(rows[0]);
  } catch (error) {
    return handleDatabaseError(error, res, next);
  }
});

router.put('/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'รหัสรายการไม่ถูกต้อง' });

  const student = normalizeStudent(req.body);
  const errors = validateStudent(student);
  if (errors.length) return res.status(400).json({ message: 'ข้อมูลไม่ถูกต้อง', errors });

  try {
    const [result] = await pool.execute(
      `UPDATE students SET student_code = ?, first_name = ?, last_name = ?, email = ?,
        phone = ?, faculty = ?, major = ?, year_level = ?, gpa = ?, date_of_birth = ?
       WHERE id = ?`,
      [...Object.values(student), id],
    );
    if (!result.affectedRows) return res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
    const [rows] = await pool.query(
      `SELECT ${selectableColumns} FROM students WHERE id = ?`,
      [id],
    );
    return res.json(rows[0]);
  } catch (error) {
    return handleDatabaseError(error, res, next);
  }
});

router.delete('/:id', async (req, res, next) => {
  const id = parseId(req.params.id);
  if (!id) return res.status(400).json({ message: 'รหัสรายการไม่ถูกต้อง' });

  try {
    const [result] = await pool.execute('DELETE FROM students WHERE id = ?', [id]);
    if (!result.affectedRows) return res.status(404).json({ message: 'ไม่พบข้อมูลนักศึกษา' });
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

export default router;

