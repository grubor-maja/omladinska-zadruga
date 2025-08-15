import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CityManagement = ({ token }) => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState({ show: false, city: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, city: null });
  const [error, setError] = useState('');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const cityRes = await axios.get('http://localhost:3000/api/cities', axiosConfig);
      setCities(cityRes.data);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (cityId) => {
    try {
      await axios.delete(`http://localhost:3000/api/cities/${cityId}`, axiosConfig);
      alert('Grad je uspešno obrisan!');
      fetchData();
      setDeleteConfirm({ show: false, city: null });
    } catch (err) {
      alert('Greška pri brisanju grada: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleUpdate = async (cityData) => {
    try {
      await axios.put(`http://localhost:3000/api/cities/${cityData.gradID}`, cityData, axiosConfig);
      alert('Grad je uspešno ažuriran!');
      fetchData();
      setEditModal({ show: false, city: null });
    } catch (err) {
      alert('Greška pri ažuriranju grada: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return (
      <div className="text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Učitava se...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-map me-2"></i>
                Upravljanje gradovima
              </h5>
            </div>
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th>ID</th>
                      <th>Naziv grada</th>
                      <th>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cities.map((city, index) => (
                      <tr key={index}>
                        <td>{city[0]}</td>
                        <td>{city[1]}</td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => setEditModal({ show: true, city })}
                              title="Izmeni grad"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => setDeleteConfirm({ show: true, city })}
                              title="Obriši grad"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {cities.length === 0 && (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-inbox display-1"></i>
                    <p className="mt-2">Nema gradova za prikaz</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      {editModal.show && (
        <EditCityModal
          city={editModal.city}
          onSave={handleUpdate}
          onCancel={() => setEditModal({ show: false, city: null })}
        />
      )}

      {}
      {deleteConfirm.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title text-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  Potvrda brisanja
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setDeleteConfirm({ show: false, city: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>Da li ste sigurni da želite da obrišete grad:</p>
                <strong>{deleteConfirm.city[1]}</strong>
                <p className="text-danger mt-2">
                  <small>Ova akcija se ne može poništiti!</small>
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirm({ show: false, city: null })}
                >
                  Otkaži
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteConfirm.city[0])}
                >
                  <i className="bi bi-trash me-1"></i>
                  Obriši
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const EditCityModal = ({ city, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    gradID: city[0],
    naziv: city[1]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await onSave(formData);
    setLoading(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pencil me-2"></i>
              Izmeni grad
            </h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label">Naziv grada *</label>
                <input
                  type="text"
                  className="form-control"
                  name="naziv"
                  value={formData.naziv}
                  onChange={handleChange}
                  placeholder="npr. Beograd, Novi Sad..."
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={loading}>
                Otkaži
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Čuva se...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    Sačuvaj izmene
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CityManagement;
