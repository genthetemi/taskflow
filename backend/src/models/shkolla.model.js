const db = require("../config/db");

const Shkolla = {
  create: async (data) => {
    const sql = "INSERT INTO shkolla (emri_shkolles, qyteti) VALUES (?, ?)";
    const [result] = await db.query(sql, [data.emri_shkolles, data.qyteti]);
    return result;
  },

  getAll: async () => {
    const sql = "SELECT * FROM shkolla";
    const [rows] = await db.query(sql);
    return rows;
  },

  getById: async (id) => {
    const sql = "SELECT * FROM shkolla WHERE id = ?";
    const [rows] = await db.query(sql, [id]);
    return rows;
  },

  update: async (id, data) => {
    const sql = "UPDATE shkolla SET emri_shkolles = ?, qyteti = ? WHERE id = ?";
    const [result] = await db.query(sql, [data.emri_shkolles, data.qyteti, id]);
    return result;
  },

  delete: async (id) => {
    const sql = "DELETE FROM shkolla WHERE id = ?";
    const [result] = await db.query(sql, [id]);
    return result;
  }

};

module.exports = Shkolla;