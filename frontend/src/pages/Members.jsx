import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import SimpleCandidateForm from '../components/SimpleCandidateForm';
import MemberCreationForm from '../components/MemberCreationForm';
import MemberEditForm from '../components/MemberEditForm';

const Members = () => {
  const [activeTab, setActiveTab] = useState('members');
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCandidateForm, setShowCandidateForm] = useState(false);
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [showMemberEditForm, setShowMemberEditForm] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [editingMember, setEditingMember] = useState(null);
  const [feeModal, setFeeModal] = useState({ show: false, member: null });
  const [memberInfoModal, setMemberInfoModal] = useState({ show: false, member: null });
  const [accessRequestModal, setAccessRequestModal] = useState({ show: false, candidate: null });
  
  const [searchFilters, setSearchFilters] = useState({
    faculty: '',
    language: '',
    searchTerm: ''
  });
  const [isSearching, setIsSearching] = useState(false);

  const token = localStorage.getItem('token');
  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchFilters.faculty || searchFilters.language || searchFilters.searchTerm) {
        searchMembers();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchFilters]);

  const fetchData = async () => {
    try {
      const [membersRes, candidatesRes] = await Promise.all([
        axios.get('http://localhost:3000/api/members', axiosConfig),
        axios.get('http://localhost:3000/api/candidates', axiosConfig)
      ]);
      
      setMembers(membersRes.data);
      setAllMembers(membersRes.data);
      setCandidates(candidatesRes.data);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const searchMembers = async () => {
    if (!searchFilters.faculty && !searchFilters.language && !searchFilters.searchTerm) {
      setMembers(allMembers);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      const params = new URLSearchParams();
      if (searchFilters.faculty) params.append('faculty', searchFilters.faculty);
      if (searchFilters.language) params.append('language', searchFilters.language);
      if (searchFilters.searchTerm) params.append('searchTerm', searchFilters.searchTerm);

      const response = await axios.get(
        `http://localhost:3000/api/members/search?${params.toString()}`,
        axiosConfig
      );
      
      setMembers(response.data);
    } catch (err) {
      setError('Greška pri pretrazi članova');
      console.error(err);
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchFilters({
      faculty: '',
      language: '',
      searchTerm: ''
    });
    setMembers(allMembers);
    setIsSearching(false);
  };

  const handleSearchChange = (field, value) => {
    setSearchFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCandidateSuccess = (candidateData) => {
    fetchData();
    setShowCandidateForm(false);
    setEditingCandidate(null);
  };

  const handleMemberSuccess = (memberData) => {
    fetchData();
    setShowMemberForm(false);
    setSelectedCandidate(null);
    clearSearch();
    alert('Član zadruge je uspešno kreiran! Lista će biti osvežena.');
  };

  const handleMemberEditSuccess = (memberData) => {
    fetchData();
    setShowMemberEditForm(false);
    setEditingMember(null);
    clearSearch();
    alert('Podaci člana su uspešno ažurirani!');
  };

  const startMemberEdit = (member) => {
    setEditingMember(member);
    setShowMemberEditForm(true);
  };

  const startMemberCreation = (candidate) => {
    setSelectedCandidate(candidate);
    setShowMemberForm(true);
  };

  const createAccessRequest = async (candidateId) => {
    try {
      await axios.post('http://localhost:3000/api/access-requests', {
        kandidatID: candidateId,
        datumZahteva: new Date().toISOString().split('T')[0],
        status: 'na_cekanju'
      }, axiosConfig);
      
      alert('Zahtev za pristupanje je uspešno kreiran!');
      fetchData();
      setAccessRequestModal({ show: false, candidate: null });
    } catch (err) {
      alert('Greška pri kreiranju zahteva: ' + (err.response?.data?.error || err.message));
    }
  };

  const approveMembership = async (candidateId) => {
    try {

      await axios.post('http://localhost:3000/api/members/from-candidate', {
        kandidatID: candidateId
      }, axiosConfig);
      
      alert('Kandidat je uspešno postao član zadruge!');
      fetchData();
    } catch (err) {
      alert('Greška pri odobravanju članstva: ' + (err.response?.data?.error || err.message));
    }
  };

  const deleteMember = async (memberId) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovog člana?')) {
      try {
        await axios.delete(`http://localhost:3000/api/members/${memberId}`, axiosConfig);
        alert('Član je uspešno obrisan!');
        fetchData();
      } catch (err) {
        alert('Greška pri brisanju člana: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  const deleteCandidate = async (candidateId) => {
    if (window.confirm('Da li ste sigurni da želite da obrišete ovog kandidata?')) {
      try {
        await axios.delete(`http://localhost:3000/api/candidates/${candidateId}`, axiosConfig);
        alert('Kandidat je uspešno obrisan!');
        fetchData();
      } catch (err) {
        alert('Greška pri brisanju kandidata: ' + (err.response?.data?.error || err.message));
      }
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

  if (showCandidateForm) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-arrow-left me-2" 
               style={{ cursor: 'pointer' }}
               onClick={() => {
                 setShowCandidateForm(false);
                 setEditingCandidate(null);
               }}
            ></i>
            {editingCandidate ? 'Izmeni kandidata' : 'Novi kandidat'}
          </h1>
        </div>
        
        <SimpleCandidateForm
          token={token}
          candidateId={editingCandidate}
          onSuccess={handleCandidateSuccess}
          onCancel={() => {
            setShowCandidateForm(false);
            setEditingCandidate(null);
          }}
        />
      </div>
    );
  }

  if (showMemberForm && selectedCandidate) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-arrow-left me-2" 
               style={{ cursor: 'pointer' }}
               onClick={() => {
                 setShowMemberForm(false);
                 setSelectedCandidate(null);
               }}
            ></i>
            Kreiranje člana zadruge
          </h1>
        </div>
        
        <MemberCreationForm
          token={token}
          candidate={selectedCandidate}
          onSuccess={handleMemberSuccess}
          onCancel={() => {
            setShowMemberForm(false);
            setSelectedCandidate(null);
          }}
        />
      </div>
    );
  }

  if (showMemberEditForm && editingMember) {
    return (
      <div className="container-fluid">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1 className="h3 mb-0">
            <i className="bi bi-arrow-left me-2" 
               style={{ cursor: 'pointer' }}
               onClick={() => {
                 setShowMemberEditForm(false);
                 setEditingMember(null);
               }}
            ></i>
            Izmena člana zadruge
          </h1>
        </div>
        
        <MemberEditForm
          token={token}
          member={editingMember}
          onSuccess={handleMemberEditSuccess}
          onCancel={() => {
            setShowMemberEditForm(false);
            setEditingMember(null);
          }}
        />
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
                <i className="bi bi-people-fill me-2"></i>
                Članovi zadruge
              </h1>
              <div>
                <button
                  className="btn btn-success"
                  onClick={() => setShowCandidateForm(true)}
                >
                  <i className="bi bi-person-plus me-1"></i>
                  Dodaj kandidata
                </button>
              </div>
            </div>

          {error && (
            <div className="alert alert-danger">
              <i className="bi bi-exclamation-triangle me-2"></i>
              {error}
            </div>
          )}

          {}
          <ul className="nav nav-tabs mb-4">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'members' ? 'active' : ''}`}
                onClick={() => setActiveTab('members')}
              >
                <i className="bi bi-people me-2"></i>
                Članovi ({members.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'candidates' ? 'active' : ''}`}
                onClick={() => setActiveTab('candidates')}
              >
                <i className="bi bi-person-check me-2"></i>
                Kandidati ({candidates.length})
              </button>
            </li>
          </ul>

          {}
          <div className="tab-content">
            {activeTab === 'members' && (
              <div className="tab-pane fade show active">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-people me-2"></i>
                      Aktivni članovi zadruge
                    </h5>
                  </div>
                  
                  <div className="card-body border-bottom bg-light">
                    <h6 className="mb-3">
                      <i className="bi bi-search me-2"></i>
                      Pretraži članove
                    </h6>
                    <div className="row g-3">
                      <div className="col-md-3">
                        <label className="form-label">Fakultet/Institucija</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="npr. ETF, PMF..."
                          value={searchFilters.faculty}
                          onChange={(e) => handleSearchChange('faculty', e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Jezik</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="npr. Engleski, Nemački..."
                          value={searchFilters.language}
                          onChange={(e) => handleSearchChange('language', e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">Opšta pretraga</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Ime, prezime, JMBG, veštine..."
                          value={searchFilters.searchTerm}
                          onChange={(e) => handleSearchChange('searchTerm', e.target.value)}
                        />
                      </div>
                      <div className="col-md-3">
                        <label className="form-label">&nbsp;</label>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-primary"
                            onClick={searchMembers}
                            disabled={isSearching}
                          >
                            {isSearching ? (
                              <>
                                <span className="spinner-border spinner-border-sm me-1"></span>
                                Pretraži
                              </>
                            ) : (
                              <>
                                <i className="bi bi-search me-1"></i>
                                Pretraži
                              </>
                            )}
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={clearSearch}
                          >
                            <i className="bi bi-x-circle me-1"></i>
                            Očisti
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {(searchFilters.faculty || searchFilters.language || searchFilters.searchTerm) && (
                      <div className="mt-3">
                        <small className="text-muted">
                          <i className="bi bi-funnel me-1"></i>
                          Aktivni filteri: 
                          {searchFilters.faculty && <span className="badge bg-primary ms-1">Fakultet: {searchFilters.faculty}</span>}
                          {searchFilters.language && <span className="badge bg-success ms-1">Jezik: {searchFilters.language}</span>}
                          {searchFilters.searchTerm && <span className="badge bg-info ms-1">Pretraga: {searchFilters.searchTerm}</span>}
                        </small>
                      </div>
                    )}
                  </div>
                  
                  <div className="card-body">{members.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-inbox display-1"></i>
                        <p className="mt-2">
                          {(searchFilters.faculty || searchFilters.language || searchFilters.searchTerm) 
                            ? 'Nema članova koji odgovaraju kriterijumima pretrage'
                            : 'Nema članova za prikaz'
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead className="table-dark">
                            <tr>
                              <th>Ime i prezime</th>
                              <th>JMBG</th>
                              <th>Telefon</th>
                              <th>Email</th>
                              <th>Datum vazenja</th>
                              <th>Akcije</th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map((member, index) => (
                              <tr key={index}>
                                <td>{member[3]} {member[4]}</td>
                                <td>{member[2]}</td>
                                <td>
                                  {member[7] && <div>M: {member[7]}</div>}
                                  {member[8] && <div>F: {member[8]}</div>}
                                  {!member[7] && !member[8] && 'N/A'}
                                </td>
                                <td>{member[6] || 'N/A'}</td>
                                <td>{member[1] ? new Date(member[1]).toLocaleDateString('sr-RS') : 'N/A'}</td>
                                <td>
                                  <div className="btn-group" role="group">
                                    <button
                                      className="btn btn-sm btn-outline-info"
                                      onClick={() => setMemberInfoModal({ show: true, member })}
                                      title="Prikaži detaljne informacije"
                                    >
                                      <i className="bi bi-info-circle"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => setFeeModal({ show: true, member })}
                                      title="Upravljaj članarinama"
                                    >
                                      <i className="bi bi-credit-card"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() => startMemberEdit(member)}
                                      title="Izmeni podatke člana"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => deleteMember(member[0])}
                                      title="Obriši člana"
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
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'candidates' && (
              <div className="tab-pane fade show active">
                <div className="card">
                  <div className="card-header">
                    <h5 className="card-title mb-0">
                      <i className="bi bi-person-check me-2"></i>
                      Kandidati za članstvo
                    </h5>
                  </div>
                  <div className="card-body">
                    {candidates.length === 0 ? (
                      <div className="text-center text-muted py-4">
                        <i className="bi bi-inbox display-1"></i>
                        <p className="mt-2">Nema kandidata za prikaz</p>
                        <button
                          className="btn btn-success"
                          onClick={() => setShowCandidateForm(true)}
                        >
                          <i className="bi bi-person-plus me-1"></i>
                          Dodaj prvog kandidata
                        </button>
                      </div>
                    ) : (
                      <div className="table-responsive">
                        <table className="table table-striped table-hover">
                          <thead className="table-dark">
                            <tr>
                              <th>Ime i prezime</th>
                              <th>JMBG</th>
                              <th>Telefon</th>
                              <th>Email</th>
                              <th>Datum rođenja</th>
                              <th>Akcije</th>
                            </tr>
                          </thead>
                          <tbody>
                            {candidates.map((candidate, index) => (
                              <tr key={index}>
                                <td>{candidate[2]} {candidate[3]}</td>
                                <td>{candidate[1]}</td>
                                <td>
                                  {candidate[5] && <div>M: {candidate[5]}</div>}
                                  {candidate[6] && <div>F: {candidate[6]}</div>}
                                  {!candidate[5] && !candidate[6] && 'N/A'}
                                </td>
                                <td>{candidate[4] || 'N/A'}</td>
                                <td>{candidate[4] ? new Date(candidate[4]).toLocaleDateString('sr-RS') : 'N/A'}</td>
                                <td>
                                  <div className="btn-group" role="group">
                                    <button
                                      className="btn btn-sm btn-outline-primary"
                                      onClick={() => startMemberCreation({
                                        KANDIDATID: candidate[0],
                                        IME: candidate[2],
                                        PREZIME: candidate[3],
                                        JMBG: candidate[1]
                                      })}
                                      title="Kreiraj člana zadruge"
                                    >
                                      <i className="bi bi-person-plus"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-warning"
                                      onClick={() => {
                                        setEditingCandidate(candidate[0]);
                                        setShowCandidateForm(true);
                                      }}
                                      title="Izmeni kandidata"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </button>
                                    <button
                                      className="btn btn-sm btn-outline-danger"
                                      onClick={() => deleteCandidate(candidate[0])}
                                      title="Obriši kandidata"
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
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      {memberInfoModal.show && (
        <MemberInfoModal
          member={memberInfoModal.member}
          token={token}
          onHide={() => setMemberInfoModal({ show: false, member: null })}
        />
      )}

      {}
      {feeModal.show && (
        <FeeManagementModal
          member={feeModal.member}
          token={token}
          onHide={() => setFeeModal({ show: false, member: null })}
        />
      )}

      {}
      {accessRequestModal.show && (
        <AccessRequestModal
          candidate={accessRequestModal.candidate}
          onConfirm={() => createAccessRequest(accessRequestModal.candidate[0])}
          onCancel={() => setAccessRequestModal({ show: false, candidate: null })}
        />
      )}
      </div>
    </div>
  );
};

const MemberInfoModal = ({ member, token, onHide }) => {
  const [memberDetails, setMemberDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchMemberDetails();
  }, []);

  const fetchMemberDetails = async () => {
    try {
      setLoading(true);
      const memberId = member[0];
      console.log('Učitavam kompletan view podatke za člana ID:', memberId);

      const memberRes = await axios.get(`http://localhost:3000/api/members/${memberId}`, axiosConfig);
      console.log('Complete member data:', memberRes.data);
      
      setMemberDetails(memberRes.data);
    } catch (err) {
      console.error('Greška pri učitavanju kompletnih detalja člana:', err);
      setError('Greška pri učitavanju podataka o članu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-xl">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-person-circle me-2"></i>
              Detaljne informacije - {member[3]} {member[4]}
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          
          <div className="modal-body">
            {loading ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Učitava se...</span>
                </div>
                <p className="mt-2">Učitavanje podataka...</p>
              </div>
            ) : error ? (
              <div className="alert alert-danger">
                <i className="bi bi-exclamation-triangle me-2"></i>
                {error}
              </div>
            ) : (
              <div className="row">
                {}
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0"><i className="bi bi-person me-2"></i>Osnovni podaci</h6>
                    </div>
                    <div className="card-body">
                      <table className="table table-borderless table-sm">
                        <tbody>
                          <tr>
                            <td><strong>Ime:</strong></td>
                            <td>{memberDetails?.basic?.Ime || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Prezime:</strong></td>
                            <td>{memberDetails?.basic?.Prezime || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>JMBG:</strong></td>
                            <td>{memberDetails?.basic?.JMBG || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Email:</strong></td>
                            <td>{memberDetails?.basic?.Email || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Mobilni:</strong></td>
                            <td>{memberDetails?.basic?.MobilniTelefon || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Fiksni:</strong></td>
                            <td>{memberDetails?.basic?.FiksniTelefon || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Broj lične karte:</strong></td>
                            <td>{memberDetails?.basic?.BrojLicneKarte || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>LBO:</strong></td>
                            <td>{memberDetails?.basic?.LBO || 'N/A'}</td>
                          </tr>
                          <tr>
                            <td><strong>Članstvo do:</strong></td>
                            <td>{memberDetails?.basic?.DatumVazenja ? new Date(memberDetails.basic.DatumVazenja).toLocaleDateString('sr-RS') : 'N/A'}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {}
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0"><i className="bi bi-mortarboard me-2"></i>Obrazovanje</h6>
                    </div>
                    <div className="card-body">
                      {memberDetails?.education && memberDetails.education.length > 0 ? (
                        memberDetails.education.map((edu, index) => (
                          <div key={index} className="mb-2">
                            <strong>{edu.NazivObrazovneUstanove || 'N/A'}</strong><br/>
                            <small className="text-muted">
                              {edu.NivoSS || 'N/A'} - {edu.Zvanje || 'N/A'}
                            </small>
                          </div>
                        ))
                      ) : (
                        <p className="text-muted">Nema podataka o obrazovanju</p>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0"><i className="bi bi-translate me-2"></i>Znanje jezika</h6>
                    </div>
                    <div className="card-body">
                      {memberDetails?.languages && memberDetails.languages.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Jezik</th>
                                <th>Nivo</th>
                              </tr>
                            </thead>
                            <tbody>
                              {memberDetails.languages.map((lang, index) => (
                                <tr key={index}>
                                  <td>{lang.NazivJezika || 'N/A'}</td>
                                  <td>
                                    <span className="badge bg-info">{lang.NivoZnanja || 'N/A'}</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">Nema podataka o znanju jezika</p>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <div className="col-md-6 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0"><i className="bi bi-briefcase me-2"></i>Profesionalni podaci</h6>
                    </div>
                    <div className="card-body">
                      {memberDetails?.biography ? (
                        <div>
                          <table className="table table-borderless table-sm">
                            <tbody>
                              <tr>
                                <td><strong>Status zaposlenja:</strong></td>
                                <td>
                                  <span className={`badge ${
                                    memberDetails.biography.StatusZaposlenja === 'Zaposlen' ? 'bg-success' : 
                                    memberDetails.biography.StatusZaposlenja === 'Nezaposlen' ? 'bg-warning' : 'bg-secondary'
                                  }`}>
                                    {memberDetails.biography.StatusZaposlenja || memberDetails.biography.RadniStatus || 'N/A'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td><strong>Sklonost ka poslovima:</strong></td>
                                <td>{memberDetails.biography.SklonostKaPoslovima || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td><strong>Profil/Zanimanje:</strong></td>
                                <td>{memberDetails.biography.ProfilZanimanje || memberDetails.biography.ProfilIZanimanje || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td><strong>IT veštine:</strong></td>
                                <td>{memberDetails.biography.ITVestine || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td><strong>Vozačka dozvola:</strong></td>
                                <td>
                                  <span className={`badge ${memberDetails.biography.VozackaDozvola ? 'bg-success' : 'bg-secondary'}`}>
                                    {memberDetails.biography.VozackaDozvola ? 'Da' : 'Ne'}
                                  </span>
                                </td>
                              </tr>
                              <tr>
                                <td><strong>Neformalno obrazovanje:</strong></td>
                                <td>{memberDetails.biography.NeformalnoObrazovanje || 'N/A'}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">Nema biografskih podataka</p>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <div className="col-12 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0"><i className="bi bi-building me-2"></i>Radno iskustvo</h6>
                    </div>
                    <div className="card-body">
                      {memberDetails?.workExperience && memberDetails.workExperience.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-striped table-sm">
                            <thead>
                              <tr>
                                <th>Kompanija</th>
                                <th>Pozicija</th>
                                <th>Period</th>
                                <th>Opis</th>
                              </tr>
                            </thead>
                            <tbody>
                              {memberDetails.workExperience.map((work, index) => (
                                <tr key={index}>
                                  <td>{work.NazivKompanije || 'N/A'}</td>
                                  <td>{work.Pozicija || 'N/A'}</td>
                                  <td>
                                    {work.DatumOd ? new Date(work.DatumOd).toLocaleDateString('sr-RS') : 'N/A'} - 
                                    {work.DatumDo ? new Date(work.DatumDo).toLocaleDateString('sr-RS') : 'trenutno'}
                                  </td>
                                  <td>{work.Opis || 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">Nema podataka o radnom iskustvu</p>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <div className="col-12 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0"><i className="bi bi-people me-2"></i>Podaci o roditeljima</h6>
                    </div>
                    <div className="card-body">
                      {memberDetails?.parents && memberDetails.parents.length > 0 ? (
                        <div className="row">
                          {memberDetails.parents.map((parent, index) => (
                            <div key={index} className="col-md-6 mb-3">
                              <div className="card border-0 bg-light">
                                <div className="card-body">
                                  <h6>{parent.ImeRoditelja} {parent.PrezimeRoditelja}</h6>
                                  <small className="text-muted">
                                    JMBG: {parent.JMBGRoditelja}<br/>
                                    Kontakt: {parent.AdresaRoditelja}
                                  </small>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted">Nema podataka o roditeljima</p>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <div className="col-12 mb-4">
                  <div className="card">
                    <div className="card-header">
                      <h6 className="mb-0"><i className="bi bi-credit-card me-2"></i>Članarine</h6>
                    </div>
                    <div className="card-body">
                      {memberDetails?.fees && memberDetails.fees.length > 0 ? (
                        <div className="table-responsive">
                          <table className="table table-sm">
                            <thead>
                              <tr>
                                <th>Iznos</th>
                                <th>Datum uplate</th>
                              </tr>
                            </thead>
                            <tbody>
                              {memberDetails.fees.map((fee, index) => (
                                <tr key={index}>
                                  <td>{fee.IznosClanarine} RSD</td>
                                  <td>{fee.DatumUplate ? new Date(fee.DatumUplate).toLocaleDateString('sr-RS') : 'N/A'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-muted">Nema članarina za prikaz</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Zatvori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FeeManagementModal = ({ member, token, onHide }) => {
  const [newFee, setNewFee] = useState({
    iznos: '',
    datumUplate: ''
  });

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

const [loading, setLoading] = useState(false);

const addFee = async () => {
  if (!newFee.iznos || !newFee.datumUplate) {
    alert('Molimo unesite iznos i datum uplate!');
    return;
  }

  if (loading) return;          // guard
  setLoading(true);

  try {
    const postData = {
      clanZadrugeID: member[0],
      datumUplate: newFee.datumUplate,
      iznos: Number(newFee.iznos)   // obavezno broj!
    };

    console.log('Saljem clanarinu bekendu sada');
    console.log('Podaci za clanarinu:', postData);

    await axios.post('http://localhost:3000/api/fees', postData, axiosConfig);

    alert('Članarina je uspešno dodana!');
    setNewFee({ iznos: '', datumUplate: '' });

    onHide();
  } catch (err) {
    console.error('Error adding fee:', err);
    alert('Greška pri dodavanju članarine: ' + (err.response?.data?.error || err.message));
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-credit-card me-2"></i>
              Članarine - {member[3]} {member[4]}
            </h5>
            <button type="button" className="btn-close" onClick={onHide}></button>
          </div>
          
          <div className="modal-body">
            {}
            <div className="card mb-4">
              <div className="card-header">
                <h6 className="mb-0">Dodaj novu članarinu</h6>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Iznos (RSD)"
                      value={newFee.iznos}
                      onChange={(e) => setNewFee({...newFee, iznos: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="date"
                      className="form-control"
                      value={newFee.datumUplate}
                      onChange={(e) => setNewFee({...newFee, datumUplate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="mt-2">
                <button
                  className="btn btn-success"
                  onClick={addFee}
                  disabled={loading}
                >
                  {loading ? 'Dodajem...' : (<><i className="bi bi-plus"></i> Dodaj članarinu</>)}
                </button>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onHide}>
              Zatvori
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AccessRequestModal = ({ candidate, onConfirm, onCancel }) => {
  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-file-earmark-plus me-2"></i>
              Kreiraj zahtev za pristupanje
            </h5>
            <button type="button" className="btn-close" onClick={onCancel}></button>
          </div>
          
          <div className="modal-body">
            <p>Da li želite da kreirate zahtev za pristupanje za kandidata:</p>
            <strong>{candidate[2]} {candidate[3]}</strong>
            <p className="text-muted mt-2">
              JMBG: {candidate[1]}<br/>
              Telefon: {candidate[5]}
            </p>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onCancel}>
              Otkaži
            </button>
            <button type="button" className="btn btn-success" onClick={onConfirm}>
              <i className="bi bi-check-circle me-1"></i>
              Kreiraj zahtev
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Members;
