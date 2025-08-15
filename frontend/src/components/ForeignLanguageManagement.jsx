import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ForeignLanguageManagement = ({ token }) => {
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [languageModal, setLanguageModal] = useState({ show: false, language: null });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, language: null });

  const [languageForm, setLanguageForm] = useState({ nazivJezika: '' });

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchLanguages();
  }, []);

  const fetchLanguages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/languages', axiosConfig);
      setLanguages(response.data);
    } catch (err) {
      setError('Greška pri učitavanju stranih jezika');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (languageModal.language) {
        await axios.put(
          `http://localhost:3000/api/languages/${languageModal.language.StraniJezikID}`,
          languageForm,
          axiosConfig
        );
        alert('Strani jezik je uspešno ažuriran!');
      } else {
        await axios.post('http://localhost:3000/api/languages', languageForm, axiosConfig);
        alert('Strani jezik je uspešno kreiran!');
      }
      fetchLanguages();
      setLanguageModal({ show: false, language: null });
      setLanguageForm({ nazivJezika: '' });
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (languageId) => {
    try {
      await axios.delete(`http://localhost:3000/api/languages/${languageId}`, axiosConfig);
      alert('Strani jezik je uspešno obrisan!');
      fetchLanguages();
      setDeleteConfirm({ show: false, language: null });
    } catch (err) {
      alert('Greška pri brisanju jezika: ' + (err.response?.data?.error || err.message));
    }
  };

  const openModal = (language = null) => {
    if (language) {
      setLanguageForm({ nazivJezika: language.NazivJezika });
      setLanguageModal({ show: true, language });
    } else {
      setLanguageForm({ nazivJezika: '' });
      setLanguageModal({ show: true, language: null });
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
              <i className="bi bi-translate me-2"></i>
              Upravljanje stranim jezicima
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
                <i className="bi bi-translate me-2"></i>
                Strani jezici
              </h5>
              <button className="btn btn-primary" onClick={() => openModal()}>
                <i className="bi bi-plus me-1"></i>
                Dodaj jezik
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Naziv jezika</th>
                      <th>Akcije</th>
                    </tr>
                  </thead>
                  <tbody>
                    {languages.map((language) => (
                      <tr key={language.StraniJezikID}>
                        <td>{language.NazivJezika}</td>
                        <td>
                          <button
                            className="btn btn-sm btn-outline-primary me-1"
                            onClick={() => openModal(language)}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setDeleteConfirm({ show: true, language })}
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
      {languageModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {languageModal.language ? 'Izmeni jezik' : 'Dodaj jezik'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setLanguageModal({ show: false, language: null })}
                ></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Naziv jezika *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={languageForm.nazivJezika}
                      onChange={(e) =>
                        setLanguageForm({ ...languageForm, nazivJezika: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setLanguageModal({ show: false, language: null })}
                  >
                    Otkaži
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {languageModal.language ? 'Ažuriraj' : 'Kreiraj'}
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
                  onClick={() => setDeleteConfirm({ show: false, language: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Da li ste sigurni da želite da obrišete jezik{' '}
                  <strong>{deleteConfirm.language?.NazivJezika}</strong>?
                </p>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirm({ show: false, language: null })}
                >
                  Otkaži
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={() => handleDelete(deleteConfirm.language.StraniJezikID)}
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

export default ForeignLanguageManagement;
