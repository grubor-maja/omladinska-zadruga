import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MemberCreationForm = ({ token, candidate, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [parentConsent, setParentConsent] = useState({
    potrebnaSaglasnost: false,
    jeSaglasan: 'Y'
  });

  const [parent, setParent] = useState({
    ime: '',
    prezime: '',
    jmbg: '',
    kontakt: ''
  });

  const [authorizedPerson, setAuthorizedPerson] = useState({
    jmbg: '',
    ime: '',
    prezime: ''
  });

  const [accessDeclaration, setAccessDeclaration] = useState({
    datumPotpisa: new Date().toISOString().split('T')[0]
  });

  const [biography, setBiography] = useState({
    vozackaDozvola: false,
    itVestine: '',
    profilIZanimanje: '',
    neformalnoObrazovanje: '',
    radniStatus: 'nezaposleni'
  });

  const [languageSkills, setLanguageSkills] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [newLanguageSkill, setNewLanguageSkill] = useState({
    straniJezikID: '',
    nivoZnanja: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/languages', axiosConfig);
        setAvailableLanguages(response.data);
      } catch (err) {
        console.error('Greška pri učitavanju jezika:', err);
      }
    };
    fetchLanguages();
  }, [token]);

  const handleParentConsentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setParentConsent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleParentsChange = (e) => {
    const { name, value } = e.target;
    setParent(prev => ({
      ...prev,
      [name]: value
    }));

    if (parentConsent.potrebnaSaglasnost) {
      const newErrors = { ...validationErrors };
      if (name === 'ime' && !value.trim()) {
        newErrors.parentIme = 'Ime roditelja je obavezno';
      } else {
        delete newErrors.parentIme;
      }
      
      if (name === 'jmbg' && value && value.length !== 13) {
        newErrors.parentJmbg = 'JMBG mora imati tačno 13 cifara';
      } else {
        delete newErrors.parentJmbg;
      }
      
      setValidationErrors(newErrors);
    }
  };

  const handleAuthorizedPersonChange = (e) => {
    const { name, value } = e.target;
    setAuthorizedPerson(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'jmbg' && value && value.length !== 13) {
      setValidationErrors(prev => ({
        ...prev,
        authorizedJmbg: 'JMBG mora imati tačno 13 cifara'
      }));
    } else {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.authorizedJmbg;
        return newErrors;
      });
    }
  };

  const handleAccessDeclarationChange = (e) => {
    const { name, value } = e.target;
    setAccessDeclaration(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBiographyChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBiography(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleLanguageSkillChange = (e) => {
    const { name, value } = e.target;
    setNewLanguageSkill(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addLanguageSkill = () => {
    if (newLanguageSkill.straniJezikID && newLanguageSkill.nivoZnanja) {

      const exists = languageSkills.some(skill => skill.straniJezikID === newLanguageSkill.straniJezikID);
      if (exists) {
        alert('Ovaj jezik je već dodat!');
        return;
      }

      const languageName = availableLanguages.find(lang => lang.StraniJezikID === parseInt(newLanguageSkill.straniJezikID))?.NazivJezika;
      
      setLanguageSkills(prev => [...prev, {
        ...newLanguageSkill,
        straniJezikID: parseInt(newLanguageSkill.straniJezikID),
        languageName
      }]);
      
      setNewLanguageSkill({ straniJezikID: '', nivoZnanja: '' });
    } else {
      alert('Molimo izaberite jezik i nivo znanja!');
    }
  };

  const removeLanguageSkill = (index) => {
    setLanguageSkills(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = {};

    if (parentConsent.potrebnaSaglasnost) {
      if (!parent.ime.trim()) {
        errors.parentIme = 'Ime roditelja je obavezno';
      }
      if (parent.jmbg && parent.jmbg.length !== 13) {
        errors.parentJmbg = 'JMBG mora imati tačno 13 cifara';
      }
    }

    if (authorizedPerson.jmbg && authorizedPerson.jmbg.length !== 13) {
      errors.authorizedJmbg = 'JMBG mora imati tačno 13 cifara';
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    setValidationErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      alert('Molimo ispravite greške u formi');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        kandidatID: candidate.KANDIDATID,
        parentConsent,
        parent: parentConsent.potrebnaSaglasnost ? parent : null,
        authorizedPerson: authorizedPerson.ime ? authorizedPerson : null,
        accessDeclaration,
        biography,
        languageSkills
      };

      console.log('=== FRONTEND PAYLOAD ===');
      console.log('Full payload:', JSON.stringify(payload, null, 2));
      console.log('languageSkills in payload:', payload.languageSkills);
      console.log('languageSkills type:', typeof payload.languageSkills);
      console.log('languageSkills is array:', Array.isArray(payload.languageSkills));

      const response = await axios.post(
        'http://localhost:3000/api/members/with-data',
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert('Članstvo je uspešno kreirano! Kandidat je sada član zadruge sa svim potrebnim podacima.');
      onSuccess(response.data);
    } catch (err) {
      console.error('Greška pri kreiranju člana:', err);
      if (err.response?.data?.error?.includes('unique constraint') || 
          err.response?.data?.error?.includes('već član')) {
        setError('Ovaj kandidat je već član zadruge! Molimo osvežite stranicu.');
      } else {
        setError(err.response?.data?.error || 'Greška pri kreiranju člana');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card">
            <div className="card-header bg-success text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-check me-2"></i>
                Dodavanje podataka i kreiranje členstva
              </h4>
              <p className="mb-0 mt-2">
                Kandidat: <strong>{candidate.IME} {candidate.PREZIME}</strong> (JMBG: {candidate.JMBG})
              </p>
              <small className="text-white-50">
                Unesite dodatne podatke za kandidata i kliknite "Kreiraj člana" da postane član zadruge
              </small>
            </div>
            
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                  {error.includes('već član') && (
                    <div className="mt-2">
                      <small>Molimo osvežite stranicu da biste videli ažuriranu listu kandidata.</small>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-success mb-3">
                      <i className="bi bi-people me-2"></i>
                      Saglasnost roditelja
                    </h5>
                  </div>

                  <div className="col-12 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="potrebnaSaglasnost"
                        checked={parentConsent.potrebnaSaglasnost}
                        onChange={handleParentConsentChange}
                      />
                      <label className="form-check-label">
                        Potrebna je saglasnost roditelja (mladoletan kandidat)
                      </label>
                    </div>
                  </div>

                  {parentConsent.potrebnaSaglasnost && (
                    <>
                      <div className="col-12 mb-3">
                        <label className="form-label">Status saglasnosti</label>
                        <select
                          className="form-select"
                          name="jeSaglasan"
                          value={parentConsent.jeSaglasan}
                          onChange={handleParentConsentChange}
                        >
                          <option value="Y">Saglasan</option>
                          <option value="N">Nije saglasan</option>
                        </select>
                      </div>

                      {}
                      <div className="col-12 mb-3">
                        <h6 className="text-muted">Podaci o roditelju</h6>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Ime *</label>
                        <input
                          type="text"
                          className={`form-control ${validationErrors.parentIme ? 'is-invalid' : ''}`}
                          name="ime"
                          value={parent.ime}
                          onChange={handleParentsChange}
                          required
                        />
                        {validationErrors.parentIme && (
                          <div className="invalid-feedback">{validationErrors.parentIme}</div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Prezime</label>
                        <input
                          type="text"
                          className="form-control"
                          name="prezime"
                          value={parent.prezime}
                          onChange={handleParentsChange}
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">JMBG</label>
                        <input
                          type="text"
                          className={`form-control ${validationErrors.parentJmbg ? 'is-invalid' : ''}`}
                          name="jmbg"
                          value={parent.jmbg}
                          onChange={handleParentsChange}
                          maxLength="13"
                          pattern="[0-9]{13}"
                        />
                        {validationErrors.parentJmbg && (
                          <div className="invalid-feedback">{validationErrors.parentJmbg}</div>
                        )}
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label">Kontakt</label>
                        <input
                          type="text"
                          className="form-control"
                          name="kontakt"
                          value={parent.kontakt}
                          onChange={handleParentsChange}
                        />
                      </div>
                    </>
                  )}
                </div>

                {}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-success mb-3">
                      <i className="bi bi-person-badge me-2"></i>
                      Ovlašćeno lice (opciono)
                    </h5>
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">JMBG</label>
                    <input
                      type="text"
                      className={`form-control ${validationErrors.authorizedJmbg ? 'is-invalid' : ''}`}
                      name="jmbg"
                      value={authorizedPerson.jmbg}
                      onChange={handleAuthorizedPersonChange}
                      maxLength="13"
                      pattern="[0-9]{13}"
                    />
                    {validationErrors.authorizedJmbg && (
                      <div className="invalid-feedback">{validationErrors.authorizedJmbg}</div>
                    )}
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Ime</label>
                    <input
                      type="text"
                      className="form-control"
                      name="ime"
                      value={authorizedPerson.ime}
                      onChange={handleAuthorizedPersonChange}
                    />
                  </div>

                  <div className="col-md-4 mb-3">
                    <label className="form-label">Prezime</label>
                    <input
                      type="text"
                      className="form-control"
                      name="prezime"
                      value={authorizedPerson.prezime}
                      onChange={handleAuthorizedPersonChange}
                    />
                  </div>
                </div>

                {}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-success mb-3">
                      <i className="bi bi-person-lines-fill me-2"></i>
                      Biografija
                    </h5>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        name="vozackaDozvola"
                        checked={biography.vozackaDozvola}
                        onChange={handleBiographyChange}
                      />
                      <label className="form-check-label">
                        Poseduje vozačku dozvolu
                      </label>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Radni status</label>
                    <select
                      className="form-select"
                      name="radniStatus"
                      value={biography.radniStatus}
                      onChange={handleBiographyChange}
                    >
                      <option value="student">Student</option>
                      <option value="ucenik">Učenik</option>
                      <option value="nezaposleni">Nezaposleni</option>
                      <option value="zaposleni">Zaposleni</option>
                    </select>
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">IT veštine</label>
                    <textarea
                      className="form-control"
                      name="itVestine"
                      value={biography.itVestine}
                      onChange={handleBiographyChange}
                      rows="2"
                      placeholder="Opišite IT veštine"
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Profil i zanimanje</label>
                    <input
                      type="text"
                      className="form-control"
                      name="profilIZanimanje"
                      value={biography.profilIZanimanje}
                      onChange={handleBiographyChange}
                    />
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Neformalno obrazovanje</label>
                    <textarea
                      className="form-control"
                      name="neformalnoObrazovanje"
                      value={biography.neformalnoObrazovanje}
                      onChange={handleBiographyChange}
                      rows="2"
                      placeholder="Opišite neformalno obrazovanje"
                    />
                  </div>
                </div>

                {}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-success mb-3">
                      <i className="bi bi-translate me-2"></i>
                      Znanje jezika
                    </h5>
                  </div>

                  {}
                  <div className="col-12 mb-3">
                    <div className="card border-light">
                      <div className="card-body">
                        <h6 className="card-title">Dodaj jezik</h6>
                        <div className="row">
                          <div className="col-md-4 mb-2">
                            <select
                              className="form-select"
                              name="straniJezikID"
                              value={newLanguageSkill.straniJezikID}
                              onChange={handleLanguageSkillChange}
                            >
                              <option value="">Izaberite jezik</option>
                              {availableLanguages.map(language => (
                                <option key={language.StraniJezikID} value={language.StraniJezikID}>
                                  {language.NazivJezika}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="col-md-4 mb-2">
                            <select
                              className="form-select"
                              name="nivoZnanja"
                              value={newLanguageSkill.nivoZnanja}
                              onChange={handleLanguageSkillChange}
                            >
                              <option value="">Izaberite nivo</option>
                              <option value="Osnovno">Osnovno</option>
                              <option value="Srednje">Srednje</option>
                              <option value="Napredno">Napredno</option>
                              <option value="Maternji">Maternji</option>
                            </select>
                          </div>
                          <div className="col-md-4 mb-2">
                            <button
                              type="button"
                              className="btn btn-success"
                              onClick={addLanguageSkill}
                            >
                              <i className="bi bi-plus"></i> Dodaj
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {}
                  {languageSkills.length > 0 && (
                    <div className="col-12 mb-3">
                      <h6>Dodati jezici:</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Jezik</th>
                              <th>Nivo znanja</th>
                              <th>Akcije</th>
                            </tr>
                          </thead>
                          <tbody>
                            {languageSkills.map((skill, index) => (
                              <tr key={index}>
                                <td>{skill.languageName}</td>
                                <td>
                                  <span className="badge bg-info">{skill.nivoZnanja}</span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => removeLanguageSkill(index)}
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
                  )}
                </div>

                {}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-success mb-3">
                      <i className="bi bi-file-text me-2"></i>
                      Pristupna izjava
                    </h5>
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Datum potpisa</label>
                    <input
                      type="date"
                      className="form-control"
                      name="datumPotpisa"
                      value={accessDeclaration.datumPotpisa}
                      onChange={handleAccessDeclarationChange}
                    />
                  </div>
                </div>

                {}
                <div className="row">
                  <div className="col-12 text-end">
                    <button
                      type="button"
                      className="btn btn-secondary me-2"
                      onClick={onCancel}
                      disabled={loading}
                    >
                      <i className="bi bi-x-circle me-1"></i>
                      Otkaži
                    </button>
                    <button
                      type="submit"
                      className="btn btn-success"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Kreiranje...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          Kreiraj člana zadruge
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberCreationForm;
