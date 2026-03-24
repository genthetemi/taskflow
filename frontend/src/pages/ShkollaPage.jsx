import React, { useEffect, useState } from "react";
import axios from "axios";
import '../styles/Shkollapage.css';

function ShkollaPage() {

  const [shkolla, setShkolla] = useState([]);
  const [emri, setEmri] = useState("");
  const [qyteti, setQyteti] = useState("");
  const [editingId, setEditingId] = useState(null);

  const API = "http://localhost:5000/api/shkolla";

  const resetForm = () => {
    setEmri("");
    setQyteti("");
    setEditingId(null);
  };

  const getShkolla = async () => {
    const res = await axios.get(API);
    setShkolla(res.data);
  };

  const saveShkolla = async () => {
    const payload = {
      emri_shkolles: emri.trim(),
      qyteti: qyteti.trim()
    };

    if (!payload.emri_shkolles || !payload.qyteti) {
      return;
    }

    if (editingId !== null) {
      await axios.put(`${API}/${editingId}`, payload);
    } else {
      await axios.post(API, payload);
    }

    resetForm();
    getShkolla();
  };

  const startEdit = (school) => {
    setEmri(school.emri_shkolles);
    setQyteti(school.qyteti);
    setEditingId(school.id);
  };

  const cancelEdit = () => {
    resetForm();
  };

  const deleteShkolla = async (id) => {
    await axios.delete(API + "/" + id);

    if (editingId === id) {
      resetForm();
    }

    getShkolla();
  };

  useEffect(() => {
    getShkolla();
  }, []);

  return (
    <div className="page-container">

      <h2 className="page-title">Menaxhimi i Shkollave</h2>

      <div className="card">
        <div className="form-row">
          <input
            placeholder="Emri i shkollës"
            value={emri}
            onChange={(e) => setEmri(e.target.value)}
          />

          <input
            placeholder="Qyteti"
            value={qyteti}
            onChange={(e) => setQyteti(e.target.value)}
          />

          <button className="btn-primary" onClick={saveShkolla}>
            {editingId !== null ? "Përditëso" : "Shto"}
          </button>

          {editingId !== null && (
            <button className="btn-danger" onClick={cancelEdit}>
              Anulo
            </button>
          )}
        </div>
      </div>

      <div className="card">
        <table className="taskflow-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Emri</th>
              <th>Qyteti</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>

            {shkolla.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.emri_shkolles}</td>
                <td>{s.qyteti}</td>

                <td>
                  <button className="btn-primary" onClick={() => startEdit(s)}>
                    Edit
                  </button>
                  <button className="btn-danger" onClick={() => deleteShkolla(s.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}

          </tbody>
        </table>
      </div>

    </div>
  );
}

export default ShkollaPage;