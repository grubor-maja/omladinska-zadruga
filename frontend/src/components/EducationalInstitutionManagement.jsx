import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EducationalInstitutionManagement = ({ token }) => {
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [institutionModal, setInstitutionModal] = useState({ show: false, institution: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, institution: null });

  const [institutionForm, setInstitutionForm] = useState({ nazivUstanove: '' });

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchInstitutions();
  }, []);

  const fetchInstitutions = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/institutions', axiosConfig);
      setInstitutions(response.data);
    } catch (err) {
      setError('Greška pri učitavanju obrazovnih ustanova');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (institutionModal.institution) {
        await axios.put(
          `http://localhost:3000/api/institutions/${institutionModal.institution.ObrazovnaUstanovaID}`,
          institutionForm,
          axiosConfig
        );
        alert('Obrazovna ustanova je uspešno ažurirana!');
      } else {
        await axios.post('http://localhost:3000/api/institutions', institutionForm, axiosConfig);
        alert('Obrazovna ustanova je uspešno kreirana!');
      }
      fetchInstitutions();
      setInstitutionModal({ show: false, institution: null });
      setInstitutionForm({ nazivUstanove: '' });
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (institutionId) => {
    try {
      await axios.delete(`http://localhost:3000/api/institutions/${institutionId}`, axiosConfig);
      alert('Obrazovna ustanova je uspešno obrisana!');
      fetchInstitutions();
      setDeleteConfirm({ show: false, institution: null });
    } catch (err) {
      alert('Greška pri brisanju ustanove: ' + (err.response?.data?.error || err.message));
    }
  };

  const openModal = (institution = null) => {
    if (institution) {
      setInstitutionForm({ nazivUstanove: institution.NazivObrazovneUstanove });
      setInstitutionModal({ show: true, institution });
    } else {
      setInstitutionForm({ nazivUstanove: '' });
      setInstitutionModal({ show: true, institution: null });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-building me-2"></i>
              Upravljanje obrazovnim ustanovama
            </h2>
          </div>

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-building me-2"></i>
                Obrazovne ustanove
              </h5>
              <button 
                className="btn btn-primary"
                onClick={() => openModal()}
              >
                <i className="bi bi-plus me-1"></i>
                Dodaj ustanovu
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Naziv ustanove</th>
                      <th>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {institutions.map((institution) => (
                      <tr key={institution.ObrazovnaUstanovaID}>
                        <td>{institution.NazivObrazovneUstanove}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => openModal(institution)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteConfirm({ show: true, institution })}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {}
      {institutionModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {institutionModal.institution ? 'Izmeni ustanovu' : 'Dodaj ustanovu'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setInstitutionModal({ show: false, institution: null })}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Naziv ustanove *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={institutionForm.nazivUstanove}
                      onChange={(e) => setInstitutionForm({...institutionForm, nazivUstanove: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setInstitutionModal({ show: false, institution: null })}
                  >
                    Otkaži
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {institutionModal.institution ? 'Ažuriraj' : 'Kreiraj'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {}
      {deleteConfirm.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Potvrdi brisanje</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setDeleteConfirm({ show: false, institution: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Da li ste sigurni da želite da obrišete ustanovu{' '}
                  <strong>{deleteConfirm.institution?.NazivObrazovneUstanove}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirm({ show: false, institution: null })}
                >
                  Otkaži
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteConfirm.institution.ObrazovnaUstanovaID)}
                >
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

export default EducationalInstitutionManagement;
