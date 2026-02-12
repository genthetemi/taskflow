const pool = require('../config/db');

const createQuestion = async ({ userId, question }) => {
  const [result] = await pool.query(
    'INSERT INTO faq_questions (user_id, question, status) VALUES (?, ?, ?)',
    [userId || null, question, 'open']
  );
  return result;
};

const listPublishedFaqs = async () => {
  const [rows] = await pool.query(
    'SELECT id, question, answer FROM faq_questions WHERE is_published = 1 AND answer IS NOT NULL ORDER BY updated_at DESC'
  );
  return rows;
};

const listQuestions = async ({ status }) => {
  let sql =
    'SELECT fq.id, fq.user_id, u.email, fq.question, fq.answer, fq.is_published, fq.status, fq.created_at, fq.updated_at, fq.answered_by, fq.answered_at ' +
    'FROM faq_questions fq LEFT JOIN users u ON fq.user_id = u.id';
  const params = [];

  if (status && status !== 'all') {
    sql += ' WHERE fq.status = ?';
    params.push(status);
  }

  sql += ' ORDER BY fq.created_at DESC';

  const [rows] = await pool.query(sql, params);
  return rows;
};

const getQuestionById = async (id) => {
  const [rows] = await pool.query(
    'SELECT id, question, answer, is_published, status FROM faq_questions WHERE id = ?',
    [id]
  );
  return rows[0];
};

const updateQuestion = async (id, fields) => {
  const keys = Object.keys(fields).filter(key => fields[key] !== undefined);
  if (!keys.length) return;

  const setClause = keys.map(key => `${key} = ?`).join(', ');
  const values = keys.map(key => fields[key]);
  values.push(id);

  await pool.query(`UPDATE faq_questions SET ${setClause} WHERE id = ?`, values);
};

module.exports = {
  createQuestion,
  listPublishedFaqs,
  listQuestions,
  getQuestionById,
  updateQuestion
};
