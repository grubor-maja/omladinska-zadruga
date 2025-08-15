import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import CompanyModal from '../components/CompanyModal';

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/companies', axiosConfig);
      setCompanies(res.data);
    } catch (err) {
      setError('Greška pri učitavanju kompanija: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pib) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovu kompaniju?')) {
      try {
        await axios.delete(`http://localhost:3000/api/companies/${pib}`, axiosConfig);
        setCompanies(companies.filter(comp => comp[0] !== pib));
        alert('Kompanija je uspešno obrisana!');
      } catch (err) {
        alert('Greška pri brisanju kompanije: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleEdit = (company) => {
    setEditingCompany({
      pib: company[0],
      naziv: company[1],
      mejl: company[2],
      mobilni: company[3],
      fiksni: company[4],
      maticniBroj: company[5],
      tekuciRacun: company[6],
      sifraDelatnosti: company[7],
      adresaID: company[8]
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingCompany(null);
    setShowModal(true);
  };

  const handleSave = () => {
    fetchCompanies();
    setShowModal(false);
    setEditingCompany(null);
  };

  if (loading) return <div className="container mt-5"><div className="text-center">Učitavanje...</div></div>;
  if (error) return <div className="container mt-5"><div className="alert alert-danger">{error}</div></div>;

  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="mb-0">
                <i className="bi bi-building me-2"></i>
                Kompanije
              </h2>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Dodaj novu kompaniju
              </button>
            </div>

            {companies.length === 0 ? (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Nema pronađenih kompanija.
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>PIB</th>
                          <th>Naziv kompanije</th>
                          <th>Kontakt podaci</th>
                          <th>Matični broj</th>
                          <th>Tekući račun</th>
                          <th>Šifra delatnosti</th>
                          <th>Akcije</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companies.map((company, index) => (
                          <tr key={index}>
                            <td><span className="badge bg-secondary">{company[0]}</span></td>
                            <td><strong>{company[1]}</strong></td>
                            <td>
                              {company[2] && (
                                <div><i className="bi bi-envelope me-1"></i>{company[2]}</div>
                              )}
                              {company[3] && (
                                <div><i className="bi bi-phone me-1"></i>{company[3]}</div>
                              )}
                              {company[4] && (
                                <div><i className="bi bi-telephone me-1"></i>{company[4]}</div>
                              )}
                            </td>
                            <td>{company[5] || 'N/A'}</td>
                            <td>{company[6] || 'N/A'}</td>
                            <td>{company[7] || 'N/A'}</td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(company)}
                                  title="Izmeni"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(company[0])}
                                  title="Obriši"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <CompanyModal
          show={showModal}
          onHide={() => setShowModal(false)}
          company={editingCompany}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Companies;
