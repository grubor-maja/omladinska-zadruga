import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import WorkerRequestModal from '../components/WorkerRequestModal';
import WorkerRequestInfoModal from '../components/WorkerRequestInfoModal';

const WorkerRequests = () => {
  const [requests, setRequests] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [editingRequest, setEditingRequest] = useState(null);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchRequests();
    fetchCompanies();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/worker-requests', axiosConfig);
      setRequests(res.data);
    } catch (err) {
      setError('Greška pri učitavanju zahteva: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
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
    if (window.confirm('Da li ste sigurni da želite da obrišete ovaj zahtev?')) {
      try {
        await axios.delete(`http://localhost:3000/api/worker-requests/${id}`, axiosConfig);
        setRequests(requests.filter(req => req[0] !== id));
        alert('Zahtev je uspešno obrisan!');
      } catch (err) {
        alert('Greška pri brisanju zahteva: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const handleEdit = (request) => {
    setEditingRequest({
      id: request[0],
      napomena: request[1],
      radnoVreme: request[2],
      profilIZanimanje: request[3],
      datumZahteva: request[4] ? new Date(request[4]).toISOString().split('T')[0] : '',
      periodObracuna: request[5],
      tipCeneRada: request[6],
      opisCeneRada: request[7],
      nazivKompanije: request[8],
      pib: request[9]
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingRequest(null);
    setShowModal(true);
  };

  const handleSave = () => {
    fetchRequests();
    setShowModal(false);
    setEditingRequest(null);
  };

  const handleShowInfo = (requestId) => {
    setSelectedRequestId(requestId);
    setShowInfoModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('sr-RS');
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
                <i className="bi bi-briefcase me-2"></i>
                Zahtevi za radnicima
              </h2>
              <button 
                className="btn btn-primary"
                onClick={handleAdd}
              >
                <i className="bi bi-plus-circle me-1"></i>
                Dodaj novi zahtev
              </button>
            </div>

            {requests.length === 0 ? (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                Nema pronađenih zahteva za radnicima.
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Kompanija</th>
                          <th>Profil/Zanimanje</th>
                          <th>Datum zahteva</th>
                          <th>Radno vreme</th>
                          <th>Tip cene rada</th>
                          <th>Opis cene</th>
                          <th>Napomena</th>
                          <th>Akcije</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requests.map((request, index) => (
                          <tr key={index}>
                            <td>
                              <strong>{request[8]}</strong>
                              <br />
                              <small className="text-muted">PIB: {request[9]}</small>
                            </td>
                            <td>
                              <span className="badge bg-info text-dark">{request[3]}</span>
                            </td>
                            <td>{formatDate(request[4])}</td>
                            <td>
                              <i className="bi bi-clock me-1"></i>
                              {request[2]}
                            </td>
                            <td>
                              <span className="badge bg-success">{request[6]}</span>
                            </td>
                            <td>{request[7] || 'N/A'}</td>
                            <td>{request[1] || 'Nema napomene'}</td>
                            <td>
                              <div className="btn-group" role="group">
                                <button
                                  className="btn btn-sm btn-outline-info"
                                  onClick={() => handleShowInfo(request[0])}
                                  title="Prikaži detalje"
                                >
                                  <i className="bi bi-info-circle"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-primary"
                                  onClick={() => handleEdit(request)}
                                  title="Izmeni"
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger"
                                  onClick={() => handleDelete(request[0])}
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
        <WorkerRequestModal
          show={showModal}
          onHide={() => setShowModal(false)}
          request={editingRequest}
          companies={companies}
          onSave={handleSave}
        />
      )}

      {showInfoModal && (
        <WorkerRequestInfoModal
          show={showInfoModal}
          onHide={() => setShowInfoModal(false)}
          requestId={selectedRequestId}
          token={token}
        />
      )}
    </div>
  );
};

export default WorkerRequests;
