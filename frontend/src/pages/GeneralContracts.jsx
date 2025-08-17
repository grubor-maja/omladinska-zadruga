import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const GeneralContracts = () => {
  const [contracts, setContracts] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchContracts();
    fetchEmployees();
    fetchCompanies();
  }, []);

  const fetchContracts = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/contracts', axiosConfig);
      setContracts(res.data);
    } catch (err) {
      setError('Greška pri učitavanju ugovora: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/employees', axiosConfig);
      setEmployees(res.data);
    } catch (err) {
      console.error('Greška pri učitavanju zaposlenih:', err);
    }
  };

  const fetchCompanies = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/companies', axiosConfig);
      setCompanies(res.data);
    } catch (err) {
      console.error('Greška pri učitavanju kompanija:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj ugovor?')) {
      try {
        await axios.delete(`http://localhost:3000/api/contracts/${id}`, axiosConfig);
        setContracts(contracts.filter(contract => contract[0] !== id));
        alert('Ugovor je uspešno obrisan!');
      } catch (err) {
        alert('Greška pri brisanju ugovora: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleEdit = (contract) => {
    setEditingContract({
      id: contract[0],
      datumPotpisivanja: contract[1] ? new Date(contract[1]).toISOString().split('T')[0] : '',
      datumVazenja: contract[2] ? new Date(contract[2]).toISOString().split('T')[0] : '',
      statusUgovora: contract[3] || 'Aktivan',
      zaposleniId: 1, // Uvek Marko 
      pib: contract[7]
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingContract(null);
    setShowModal(true);
  };

  const handleSave = () => {
    fetchContracts();
    setShowModal(false);
    setEditingContract(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div>
      <Navbar />
      <div className="container mt-4">
        <div className="alert alert-danger">{error}</div>
      </div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2>
            <i className="bi bi-file-earmark-text me-2"></i>
            Generalni ugovori
          </h2>
          <button className="btn btn-primary" onClick={handleAdd}>
            <i className="bi bi-plus-circle me-2"></i>
            Dodaj novi ugovor
          </button>
        </div>

        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Datum potpisivanja</th>
                    <th>Datum važenja</th>
                    <th>Status</th>
                    <th>Zaposleni</th>
                    <th>Pozicija</th>
                    <th>Kompanija</th>
                    <th>PIB</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {contracts.length === 0 ? (
                    <tr>
                      <td colSpan="9" className="text-center text-muted">
                        Nema unetih ugovora
                      </td>
                    </tr>
                  ) : (
                    contracts.map((contract, index) => (
                      <tr key={index}>

                        <td>{formatDate(contract[1])}</td>
                        <td>{formatDate(contract[2])}</td>
                        <td>
                          <span className={`badge ${
                            contract[3] === 'Aktivan' ? 'bg-success' : 
                            contract[3] === 'Istekao' ? 'bg-danger' : 'bg-warning'
                          }`}>
                            {contract[3]}
                          </span>
                        </td>
                        <td>{contract[4]}</td>
                        <td>
                          <span className={`badge ${
                            contract[5] === 'direktor' ? 'bg-primary' : 'bg-secondary'
                          }`}>
                            {contract[5] === 'direktor' ? 'Direktor' : 'Zaposleni'}
                          </span>
                        </td>
                        <td>{contract[6]}</td>
                        <td>
                          <code>{contract[7]}</code>
                        </td>
                        <td>
                          <div className="btn-group" role="group">
                            <button
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEdit(contract)}
                              title="Izmeni"
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDelete(contract[0])}
                              title="Obriši"
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {showModal && (
          <ContractModal
            show={showModal}
            onHide={() => setShowModal(false)}
            contract={editingContract}
            employees={employees}
            companies={companies}
            onSave={handleSave}
          />
        )}
      </div>
    </div>
  );
};

const ContractModal = ({ show, onHide, contract, employees, companies, onSave }) => {
  const [formData, setFormData] = useState({
    datumVazenja: '',
    statusUgovora: 'Aktivan',
    pib: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (contract) {
      setFormData({
        datumVazenja: contract.datumVazenja || '',
        statusUgovora: contract.statusUgovora || 'Aktivan',
        pib: contract.pib || ''
      });
    } else {
      setFormData({
        datumVazenja: '',
        statusUgovora: 'Aktivan',
        pib: ''
      });
    }
    setError('');
  }, [contract, show]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const axiosConfig = {
        headers: { Authorization: `Bearer ${token}` }
      };

      if (contract) {

          const updateData = {
            datumPotpisivanja: contract.datumPotpisivanja,       
            datumVazenja: formData.datumVazenja || null,            
            statusUgovora: formData.statusUgovora,
            zaposleniId: 1,
            pib: formData.pib
          };
        
        await axios.put(
          `http://localhost:3000/api/contracts/${contract.id}`,
          updateData,
          axiosConfig
        );
        alert('Ugovor je uspešno ažuriran!');
      } else {

        await axios.post(
          'http://localhost:3000/api/contracts',
          { pib: formData.pib },
          axiosConfig
        );
        alert('Ugovor je uspešno kreiran!');
      }
      
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-file-earmark-text me-2"></i>
              {contract ? 'Izmeni generalni ugovor' : 'Dodaj novi generalni ugovor'}
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {!contract && (
                <div className="mb-3">
                  <label className="form-label">
                    <i className="bi bi-building me-1"></i>
                    Kompanija *
                  </label>
                  <select
                    className="form-select"
                    name="pib"
                    value={formData.pib}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Izaberi kompaniju...</option>
                    {companies.map((company, index) => (
                      <option key={index} value={company[0]}>
                        {company[1]} (PIB: {company[0]})
                      </option>
                    ))}
                  </select>
                  <div className="form-text">
                    Datum potpisivanja i zaposleni se automatski postavljaju
                  </div>
                </div>
              )}

              {contract && (
                <>
                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-building me-1"></i>
                      Kompanija
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      value={companies.find(c => c[0] === formData.pib)?.[1] || 'Nepoznato'}
                      disabled
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-calendar-check me-1"></i>
                      Datum važenja
                    </label>
                    <input
                      type="date"
                      className="form-control"
                      name="datumVazenja"
                      value={formData.datumVazenja}
                      onChange={handleChange}
                    />
                    <div className="form-text">
                      Ostavite prazno za ugovor na neodređeno vreme
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">
                      <i className="bi bi-check-circle me-1"></i>
                      Status ugovora *
                    </label>
                    <select
                      className="form-select"
                      name="statusUgovora"
                      value={formData.statusUgovora}
                      onChange={handleChange}
                      required
                    >
                      <option value="Aktivan">Aktivan</option>
                      <option value="Istekao">Istekao</option>
                      <option value="Suspendovan">Suspendovan</option>
                    </select>
                  </div>
                </>
              )}
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary" 
                onClick={onHide}
                disabled={loading}
              >
                Otkaži
              </button>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Čuva se...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    {contract ? 'Ažuriraj' : 'Kreiraj'} ugovor
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

export default GeneralContracts;
