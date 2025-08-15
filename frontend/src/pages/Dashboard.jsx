import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const [candidates, setCandidates] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [institutions, setInstitutions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    institutionId: '',
    languageId: '',
    languageLevel: ''
  });

  const [filteredCandidates, setFilteredCandidates] = useState([]);

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [candidates, filters]);

  const fetchData = async () => {
    try {
      const [candidatesRes, requestsRes, institutionsRes, languagesRes] = await Promise.all([
        axios.get('http://localhost:3000/api/candidates', axiosConfig), // Postojeći endpoint
        axios.get('http://localhost:3000/api/worker-requests', axiosConfig),
        axios.get('http://localhost:3000/api/institutions', axiosConfig),
        axios.get('http://localhost:3000/api/languages', axiosConfig) // Ispravka: languages umesto foreign-languages
      ]);
      
      setCandidates(candidatesRes.data);
      setActiveRequests(requestsRes.data);
      setInstitutions(institutionsRes.data);
      setLanguages(languagesRes.data);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...candidates];

    setFilteredCandidates(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      institutionId: '',
      languageId: '',
      languageLevel: ''
    });
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
    <div>
      <Navbar />
      <div className="container-fluid mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h1 className="h3 mb-0">
                <i className="bi bi-speedometer2 me-2"></i>
                Dashboard
              </h1>
            </div>

            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {}
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-people-fill text-primary" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title mt-2">{candidates.length}</h5>
                    <p className="card-text">Ukupno kandidata</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-briefcase-fill text-success" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title mt-2">{activeRequests.length}</h5>
                    <p className="card-text">Aktivni zahtevi</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-mortarboard-fill text-warning" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title mt-2">{institutions.length}</h5>
                    <p className="card-text">Obrazovne ustanove</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-translate text-info" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title mt-2">{languages.length}</h5>
                    <p className="card-text">Strani jezici</p>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="row">
              <div className="col-md-8">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-person-lines-fill me-2"></i>
                      Kandidati ({filteredCandidates.length})
                    </h5>
                  </div>
                  <div className="card-body">
                    {filteredCandidates.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-inbox display-1"></i>
                        <p className="mt-2">Nema kandidata koji odgovaraju filterima</p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped table-hover table-sm">
                          <thead className="table-dark">
                            <tr>
                              <th>Ime i prezime</th>
                              <th>Kontakt</th>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredCandidates.map((candidate, index) => (
                              <tr key={index}>
                                <td>
                                  <strong>{candidate[2]} {candidate[3]}</strong><br/>
                                  <small className="text-muted">JMBG: {candidate[1]}</small>
                                </td>

                                <td>
                                  {candidate[5] && <div><small>M: {candidate[5]}</small></div>}
                                  {candidate[6] && <div><small>F: {candidate[6]}</small></div>}
                                  {candidate[7] && <div><small>E: {candidate[7]}</small></div>}
                                  {!candidate[5] && !candidate[6] && !candidate[7] && <small className="text-muted">N/A</small>}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {}
              <div className="col-md-4">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-clipboard-check me-2"></i>
                      Aktivni zahtevi ({activeRequests.length})
                    </h5>
                  </div>
                  <div className="card-body">
                    {activeRequests.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-clipboard-x"></i>
                        <p className="mt-2">Nema aktivnih zahteva</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {activeRequests.slice(0, 10).map((request, index) => (
                          <div key={index} className="list-group-item px-0">
                            <div className="d-flex justify-content-between align-items-start">
                              <div>
                                <h6 className="mb-1">{request[3]}</h6>
                                <p className="mb-1 small">{request[8]}</p>
                                <small className="text-muted">
                                  Datum: {new Date(request[4]).toLocaleDateString('sr-RS')}
                                </small>
                              </div>
                              <span className="badge bg-info">
                                {request[2]}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
