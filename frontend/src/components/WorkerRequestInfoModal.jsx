import React, { useState, useEffect } from 'react';
import axios from 'axios';

const WorkerRequestInfoModal = ({ show, onHide, requestId, token }) => {
  const [requestDetails, setRequestDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if (show && requestId) {
      fetchRequestDetails();
    }
  }, [show, requestId]);

  const fetchRequestDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(
        `http://localhost:3000/api/worker-requests/${requestId}/details`,
        axiosConfig
      );
      setRequestDetails(response.data);
    } catch (err) {
      setError('Greška pri učitavanju detalja zahteva: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sr-RS');
  };

  const getTotalWorkers = () => {
    if (!requestDetails?.workerStructures) return 0;
    return requestDetails.workerStructures.reduce((total, structure) => total + structure.BrojRadnika, 0);
  };

  const getGenderLabel = (pol) => {
    return pol === 'M' ? 'Muški' : pol === 'Z' ? 'Ženski' : 'N/A';
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">
              <i className="bi bi-info-circle me-2"></i>
              Detalji zahteva za radnicima
            </h5>
            <button
              type="button"
              className="btn-close btn-close-white"
              onClick={onHide}
            ></button>
          </div>

          <div className="modal-body">
            {loading && (
              <div className="text-center">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Učitavanje...</span>
                </div>
              </div>
            )}

            {error && (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}

            {requestDetails && (
              <div className="row">
                {}
                <div className="col-12 mb-4">
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-briefcase me-2"></i>
                    Osnovni podaci o zahtevu
                  </h6>
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Profil/Zanimanje:</label>
                          <div className="fw-bold">{requestDetails.request.ProfilIZanimanje}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Datum zahteva:</label>
                          <div className="fw-bold">{formatDate(requestDetails.request.DatumZahteva)}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Radno vreme:</label>
                          <div className="fw-bold">{requestDetails.request.RadnoVreme}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Period obračuna:</label>
                          <div className="fw-bold">{requestDetails.request.PeriodObracuna}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Tip cene rada:</label>
                          <div><span className="badge bg-success">{requestDetails.request.TipCeneRada}</span></div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Opis cene rada:</label>
                          <div className="fw-bold">{requestDetails.request.OpisCeneRada || 'N/A'}</div>
                        </div>
                        <div className="col-12 mb-3">
                          <label className="form-label text-muted">Napomena:</label>
                          <div className="fw-bold">{requestDetails.request.Napomena || 'Nema napomene'}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="col-12 mb-4">
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-building me-2"></i>
                    Podaci o kompaniji
                  </h6>
                  <div className="card">
                    <div className="card-body">
                      <div className="row">
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Naziv kompanije:</label>
                          <div className="fw-bold">{requestDetails.company.NazivKompanije}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">PIB:</label>
                          <div><span className="badge bg-secondary">{requestDetails.company.PIB}</span></div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Matični broj:</label>
                          <div className="fw-bold">{requestDetails.company.MaticniBroj || 'N/A'}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Tekući račun:</label>
                          <div className="fw-bold">{requestDetails.company.TekuciRacun || 'N/A'}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Šifra delatnosti:</label>
                          <div className="fw-bold">{requestDetails.company.SifraDelatnosti || 'N/A'}</div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Email:</label>
                          <div className="fw-bold">
                            {requestDetails.company.Email ? (
                              <a href={`mailto:${requestDetails.company.Email}`}>{requestDetails.company.Email}</a>
                            ) : 'N/A'}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Mobilni telefon:</label>
                          <div className="fw-bold">
                            {requestDetails.company.MobilniTelefon ? (
                              <a href={`tel:${requestDetails.company.MobilniTelefon}`}>{requestDetails.company.MobilniTelefon}</a>
                            ) : 'N/A'}
                          </div>
                        </div>
                        <div className="col-md-6 mb-3">
                          <label className="form-label text-muted">Fiksni telefon:</label>
                          <div className="fw-bold">
                            {requestDetails.company.FiksniTelefon ? (
                              <a href={`tel:${requestDetails.company.FiksniTelefon}`}>{requestDetails.company.FiksniTelefon}</a>
                            ) : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {}
                <div className="col-12 mb-4">
                  <h6 className="text-primary mb-3">
                    <i className="bi bi-people me-2"></i>
                    Struktura radnika 
                    <span className="badge bg-info ms-2">
                      Ukupno: {getTotalWorkers()} radnika
                    </span>
                  </h6>
                  <div className="card">
                    <div className="card-body">
                      {requestDetails.workerStructures.length === 0 ? (
                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          Nije definisana struktura radnika za ovaj zahtev.
                        </div>
                      ) : (
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead className="table-light">
                              <tr>
                                <th>Pol</th>
                                <th>Broj radnika</th>
                                <th>Procenat</th>
                              </tr>
                            </thead>
                            <tbody>
                              {requestDetails.workerStructures.map((structure, index) => (
                                <tr key={index}>
                                  <td>
                                    <span className={`badge ${structure.Pol === 'M' ? 'bg-primary' : 'bg-warning'}`}>
                                      {getGenderLabel(structure.Pol)}
                                    </span>
                                  </td>
                                  <td className="fw-bold">{structure.BrojRadnika}</td>
                                  <td>
                                    {getTotalWorkers() > 0 ? 
                                      `${((structure.BrojRadnika / getTotalWorkers()) * 100).toFixed(1)}%` : 
                                      '0%'
                                    }
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
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onHide}
            >
              <i className="bi bi-x-circle me-1"></i>
              Zatvori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkerRequestInfoModal;
