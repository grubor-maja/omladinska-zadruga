import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CandidateForm = ({ token, onSuccess, candidateToEdit = null }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [basicData, setBasicData] = useState({
    jmbg: '',
    ime: '',
    prezime: '',
    datumRodjenja: '',
    telefon: '',
    email: '',
    brojLicneKarte: '',
    lbo: '',
    imeRoditelja: ''  // Jedan roditelj u osnovnim podacima
  });

  const [validationErrors, setValidationErrors] = useState({});

  const [education, setEducation] = useState({
    nazivUstanove: '',
    tipObrazovanja: 'osnovno',
    datumPocetka: '',
    datumZavrsetka: '',
    prosecnaOcena: ''
  });

  const [languages, setLanguages] = useState([]);
  const [newLanguage, setNewLanguage] = useState({
    nazivJezika: '',
    nivoZnanja: 'A1'
  });

  const [workExperiences, setWorkExperiences] = useState([]);
  const [newWorkExperience, setNewWorkExperience] = useState({
    nazivPozicije: '',
    nazivKompanije: '',
    datumPocetka: '',
    datumZavrsetka: '',
    opisPosla: ''
  });

  const [parentConsent, setParentConsent] = useState({
    potrebnaSaglasnost: false,
    imeRoditelja: '',
    prezimeRoditelja: '',
    jmbgRoditelja: '',
    kontaktRoditelja: '',
    brojOdluke: '',
    datumOdluke: '',
    sudskaInstanca: ''
  });

  const [authorizedPerson, setAuthorizedPerson] = useState({
    ime: '',
    prezime: '',
    jmbg: '',
    kontaktTelefon: ''
  });

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    if (candidateToEdit) {
      loadCandidateData(candidateToEdit);
    }
  }, [candidateToEdit]);

  const loadCandidateData = async (candidateId) => {
    try {
      const res = await axios.get(`http://localhost:3000/api/candidates/${candidateId}`, axiosConfig);
      const data = res.data;
      
      setBasicData({
        jmbg: data.jmbg || '',
        ime: data.ime || '',
        prezime: data.prezime || '',
        datumRodjenja: data.datumRodjenja ? data.datumRodjenja.split('T')[0] : '',
        telefon: data.telefon || '',
        email: data.email || '',
        brojLicneKarte: data.brojLicneKarte || '',
        lbo: data.lbo || '',
        imeRoditelja: data.imeRoditelja || ''
      });

    } catch (err) {
      setError('Greška pri učitavanju podataka kandidata');
      console.error(err);
    }
  };

  const checkAge = (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    const age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      return age - 1;
    }
    return age;
  };

  const validateJMBG = (jmbg) => {
    const jmbgRegex = /^[0-9]{13}$/;
    return jmbgRegex.test(jmbg);
  };

  const validateEmail = (email) => {
    if (!email) return true; // Email nije obavezan
    const emailRegex = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^06[0-9]\d{6,7}$/;
    return phoneRegex.test(phone);
  };

  const validateLicnaKarta = (broj) => {
    if (!broj) return false; // Obavezno polje
    const licnaRegex = /^[0-9]{9}$/;
    return licnaRegex.test(broj);
  };

  const validateLBO = (lbo) => {
    if (!lbo) return false; // Obavezno polje
    const lboRegex = /^[0-9]{11}$/;
    return lboRegex.test(lbo);
  };

  const validateField = (name, value) => {
    let error = '';
    
    switch (name) {
      case 'jmbg':
        if (!value) error = 'JMBG je obavezan';
        else if (!validateJMBG(value)) error = 'JMBG mora imati tačno 13 cifara';
        break;
      case 'ime':
        if (!value) error = 'Ime je obavezno';
        else if (value.length < 2) error = 'Ime mora imati najmanje 2 karaktera';
        break;
      case 'prezime':
        if (!value) error = 'Prezime je obavezno';
        else if (value.length < 2) error = 'Prezime mora imati najmanje 2 karaktera';
        break;
      case 'datumRodjenja':
        if (!value) error = 'Datum rođenja je obavezan';
        break;
      case 'telefon':
        if (!value) error = 'Telefon je obavezan';
        else if (!validatePhone(value)) error = 'Telefon mora biti u formatu 06XXXXXXX';
        break;
      case 'email':
        if (value && !validateEmail(value)) error = 'Email adresa nije validna';
        break;
      case 'brojLicneKarte':
        if (!value) error = 'Broj lične karte je obavezan';
        else if (!validateLicnaKarta(value)) error = 'Broj lične karte mora imati 9 cifara';
        break;
      case 'lbo':
        if (!value) error = 'LBO je obavezan';
        else if (!validateLBO(value)) error = 'LBO mora imati 11 cifara';
        break;
      case 'imeRoditelja':
        if (!value) error = 'Ime roditelja je obavezno';
        else if (value.length < 2) error = 'Ime roditelja mora imati najmanje 2 karaktera';
        break;
    }
    
    setValidationErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return error === '';
  };

  useEffect(() => {
    if (basicData.datumRodjenja) {
      const age = checkAge(basicData.datumRodjenja);
      setParentConsent(prev => ({
        ...prev,
        potrebnaSaglasnost: age < 18
      }));
    }
  }, [basicData.datumRodjenja]);

  const handleBasicDataChange = (e) => {
    const { name, value } = e.target;

    let correctedValue = value;
    
    if (name === 'jmbg' || name === 'brojLicneKarte' || name === 'lbo') {

      correctedValue = value.replace(/[^0-9]/g, '');
    }
    
    if (name === 'telefon') {

      correctedValue = value.replace(/[^0-9]/g, '');

      if (correctedValue.length > 0 && !correctedValue.startsWith('06')) {
        correctedValue = '06' + correctedValue;
      }

      correctedValue = correctedValue.substring(0, 9);
    }
    
    setBasicData({
      ...basicData,
      [name]: correctedValue
    });

    validateField(name, correctedValue);
  };

  const handleEducationChange = (e) => {
    setEducation({
      ...education,
      [e.target.name]: e.target.value
    });
  };

  const addLanguage = () => {
    if (newLanguage.nazivJezika.trim()) {
      setLanguages([...languages, { ...newLanguage }]);
      setNewLanguage({ nazivJezika: '', nivoZnanja: 'A1' });
    }
  };

  const removeLanguage = (index) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  const addWorkExperience = () => {
    if (newWorkExperience.nazivPozicije.trim() && newWorkExperience.nazivKompanije.trim()) {
      setWorkExperiences([...workExperiences, { ...newWorkExperience }]);
      setNewWorkExperience({
        nazivPozicije: '',
        nazivKompanije: '',
        datumPocetka: '',
        datumZavrsetka: '',
        opisPosla: ''
      });
    }
  };

  const removeWorkExperience = (index) => {
    setWorkExperiences(workExperiences.filter((_, i) => i !== index));
  };

  const handleParentConsentChange = (e) => {
    setParentConsent({
      ...parentConsent,
      [e.target.name]: e.target.value
    });
  };

  const handleAuthorizedPersonChange = (e) => {
    setAuthorizedPerson({
      ...authorizedPerson,
      [e.target.name]: e.target.value
    });
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        return basicData.jmbg && basicData.ime && basicData.prezime && 
               basicData.datumRodjenja && basicData.telefon && basicData.brojLicneKarte && 
               basicData.lbo && basicData.imeRoditelja;
      case 2:
        return education.nazivUstanove && education.tipObrazovanja;
      case 5:
        if (parentConsent.potrebnaSaglasnost) {
          return parentConsent.imeRoditelja && parentConsent.prezimeRoditelja && 
                 parentConsent.jmbgRoditelja && parentConsent.kontaktRoditelja;
        }
        return true;
      case 6:
        return authorizedPerson.ime && authorizedPerson.prezime && 
               authorizedPerson.jmbg && authorizedPerson.kontaktTelefon;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 6));
      setError('');
    } else {
      setError('Molimo popunite sva obavezna polja!');
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setError('');
  };

  const handleSubmit = async () => {
    if (!validateStep(6)) {
      setError('Molimo popunite sva obavezna polja!');
      return;
    }

    setLoading(true);
    setError('');

    try {

      const candidateData = {
        ...basicData,
        education,
        languages,
        workExperiences,
        parentConsent: parentConsent.potrebnaSaglasnost ? parentConsent : null,
        authorizedPerson
      };

      let response;
      if (candidateToEdit) {
        response = await axios.put(`http://localhost:3000/api/candidates/${candidateToEdit}`, candidateData, axiosConfig);
      } else {
        response = await axios.post('http://localhost:3000/api/candidates', candidateData, axiosConfig);
      }

      alert(candidateToEdit ? 'Kandidat je uspešno ažuriran!' : 'Kandidat je uspešno kreiran!');
      onSuccess(response.data);

    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="bi bi-person me-2"></i>
                Osnovni podaci
              </h4>
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">JMBG *</label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.jmbg ? 'is-invalid' : ''}`}
                  name="jmbg"
                  value={basicData.jmbg}
                  onChange={handleBasicDataChange}
                  maxLength="13"
                  required
                />
                {validationErrors.jmbg && (
                  <div className="invalid-feedback">{validationErrors.jmbg}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Datum rođenja *</label>
                <input
                  type="date"
                  className={`form-control ${validationErrors.datumRodjenja ? 'is-invalid' : ''}`}
                  name="datumRodjenja"
                  value={basicData.datumRodjenja}
                  onChange={handleBasicDataChange}
                  required
                />
                {validationErrors.datumRodjenja && (
                  <div className="invalid-feedback">{validationErrors.datumRodjenja}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Ime *</label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.ime ? 'is-invalid' : ''}`}
                  name="ime"
                  value={basicData.ime}
                  onChange={handleBasicDataChange}
                  required
                />
                {validationErrors.ime && (
                  <div className="invalid-feedback">{validationErrors.ime}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Prezime *</label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.prezime ? 'is-invalid' : ''}`}
                  name="prezime"
                  value={basicData.prezime}
                  onChange={handleBasicDataChange}
                  required
                />
                {validationErrors.prezime && (
                  <div className="invalid-feedback">{validationErrors.prezime}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Telefon *</label>
                <input
                  type="tel"
                  className={`form-control ${validationErrors.telefon ? 'is-invalid' : ''}`}
                  name="telefon"
                  value={basicData.telefon}
                  onChange={handleBasicDataChange}
                  required
                />
                {validationErrors.telefon && (
                  <div className="invalid-feedback">{validationErrors.telefon}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className={`form-control ${validationErrors.email ? 'is-invalid' : ''}`}
                  name="email"
                  value={basicData.email}
                  onChange={handleBasicDataChange}
                />
                {validationErrors.email && (
                  <div className="invalid-feedback">{validationErrors.email}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Ime roditelja *</label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.imeRoditelja ? 'is-invalid' : ''}`}
                  name="imeRoditelja"
                  value={basicData.imeRoditelja}
                  onChange={handleBasicDataChange}
                  required
                />
                {validationErrors.imeRoditelja && (
                  <div className="invalid-feedback">{validationErrors.imeRoditelja}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Broj lične karte *</label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.brojLicneKarte ? 'is-invalid' : ''}`}
                  name="brojLicneKarte"
                  value={basicData.brojLicneKarte}
                  onChange={handleBasicDataChange}
                  maxLength="9"
                  required
                />
                {validationErrors.brojLicneKarte && (
                  <div className="invalid-feedback">{validationErrors.brojLicneKarte}</div>
                )}
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">LBO *</label>
                <input
                  type="text"
                  className={`form-control ${validationErrors.lbo ? 'is-invalid' : ''}`}
                  name="lbo"
                  value={basicData.lbo}
                  onChange={handleBasicDataChange}
                  maxLength="11"
                  required
                />
                {validationErrors.lbo && (
                  <div className="invalid-feedback">{validationErrors.lbo}</div>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="bi bi-mortarboard me-2"></i>
                Obrazovanje
              </h4>
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Naziv ustanove *</label>
                <input
                  type="text"
                  className="form-control"
                  name="nazivUstanove"
                  value={education.nazivUstanove}
                  onChange={handleEducationChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Tip obrazovanja *</label>
                <select
                  className="form-select"
                  name="tipObrazovanja"
                  value={education.tipObrazovanja}
                  onChange={handleEducationChange}
                  required
                >
                  <option value="osnovno">Osnovno</option>
                  <option value="srednje">Srednje</option>
                  <option value="vise">Više</option>
                  <option value="visoko">Visoko</option>
                </select>
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Datum početka</label>
                <input
                  type="date"
                  className="form-control"
                  name="datumPocetka"
                  value={education.datumPocetka}
                  onChange={handleEducationChange}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Datum završetka</label>
                <input
                  type="date"
                  className="form-control"
                  name="datumZavrsetka"
                  value={education.datumZavrsetka}
                  onChange={handleEducationChange}
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Prosečna ocena</label>
                <input
                  type="number"
                  className="form-control"
                  name="prosecnaOcena"
                  value={education.prosecnaOcena}
                  onChange={handleEducationChange}
                  min="6.00"
                  max="10.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="bi bi-translate me-2"></i>
                Jezici
              </h4>
            </div>
            
            <div className="col-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Dodaj jezik</h5>
                  <div className="row">
                    <div className="col-md-6">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Naziv jezika"
                        value={newLanguage.nazivJezika}
                        onChange={(e) => setNewLanguage({...newLanguage, nazivJezika: e.target.value})}
                      />
                    </div>
                    <div className="col-md-4">
                      <select
                        className="form-select"
                        value={newLanguage.nivoZnanja}
                        onChange={(e) => setNewLanguage({...newLanguage, nivoZnanja: e.target.value})}
                      >
                        <option value="A1">A1 - Početni</option>
                        <option value="A2">A2 - Osnovni</option>
                        <option value="B1">B1 - Srednji</option>
                        <option value="B2">B2 - Viši srednji</option>
                        <option value="C1">C1 - Napredni</option>
                        <option value="C2">C2 - Majstorski</option>
                      </select>
                    </div>
                    <div className="col-md-2">
                      <button
                        type="button"
                        className="btn btn-primary"
                        onClick={addLanguage}
                      >
                        <i className="bi bi-plus"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              {languages.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Jezik</th>
                        <th>Nivo znanja</th>
                        <th>Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {languages.map((lang, index) => (
                        <tr key={index}>
                          <td>{lang.nazivJezika}</td>
                          <td>{lang.nivoZnanja}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => removeLanguage(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="bi bi-briefcase me-2"></i>
                Radna iskustva
              </h4>
            </div>
            
            <div className="col-12 mb-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Dodaj radno iskustvo</h5>
                  <div className="row">
                    <div className="col-md-4">
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Pozicija"
                          value={newWorkExperience.nazivPozicije}
                          onChange={(e) => setNewWorkExperience({...newWorkExperience, nazivPozicije: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Kompanija"
                          value={newWorkExperience.nazivKompanije}
                          onChange={(e) => setNewWorkExperience({...newWorkExperience, nazivKompanije: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-4">
                      <div className="mb-3">
                        <button
                          type="button"
                          className="btn btn-primary w-100"
                          onClick={addWorkExperience}
                        >
                          <i className="bi bi-plus me-1"></i>
                          Dodaj iskustvo
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Datum početka</label>
                        <input
                          type="date"
                          className="form-control"
                          value={newWorkExperience.datumPocetka}
                          onChange={(e) => setNewWorkExperience({...newWorkExperience, datumPocetka: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Datum završetka</label>
                        <input
                          type="date"
                          className="form-control"
                          value={newWorkExperience.datumZavrsetka}
                          onChange={(e) => setNewWorkExperience({...newWorkExperience, datumZavrsetka: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-12">
                      <div className="mb-3">
                        <label className="form-label">Opis posla</label>
                        <textarea
                          className="form-control"
                          rows="3"
                          value={newWorkExperience.opisPosla}
                          onChange={(e) => setNewWorkExperience({...newWorkExperience, opisPosla: e.target.value})}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12">
              {workExperiences.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead>
                      <tr>
                        <th>Pozicija</th>
                        <th>Kompanija</th>
                        <th>Period</th>
                        <th>Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workExperiences.map((exp, index) => (
                        <tr key={index}>
                          <td>{exp.nazivPozicije}</td>
                          <td>{exp.nazivKompanije}</td>
                          <td>{exp.datumPocetka} - {exp.datumZavrsetka || 'trenutno'}</td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => removeWorkExperience(index)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        );

      case 5:
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="bi bi-file-text me-2"></i>
                Saglasnost roditelja
              </h4>
            </div>
            
            {parentConsent.potrebnaSaglasnost ? (
              <>
                <div className="col-12 mb-3">
                  <div className="alert alert-info">
                    <i className="bi bi-info-circle me-2"></i>
                    Kandidat je maloletan, potrebna je saglasnost roditelja.
                  </div>
                </div>
                
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Ime roditelja *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="imeRoditelja"
                      value={parentConsent.imeRoditelja}
                      onChange={handleParentConsentChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Prezime roditelja *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="prezimeRoditelja"
                      value={parentConsent.prezimeRoditelja}
                      onChange={handleParentConsentChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">JMBG roditelja *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="jmbgRoditelja"
                      value={parentConsent.jmbgRoditelja}
                      onChange={handleParentConsentChange}
                      maxLength="13"
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Kontakt roditelja *</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="kontaktRoditelja"
                      value={parentConsent.kontaktRoditelja}
                      onChange={handleParentConsentChange}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Broj odluke</label>
                    <input
                      type="text"
                      className="form-control"
                      name="brojOdluke"
                      value={parentConsent.brojOdluke}
                      onChange={handleParentConsentChange}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Datum odluke</label>
                    <input
                      type="date"
                      className="form-control"
                      name="datumOdluke"
                      value={parentConsent.datumOdluke}
                      onChange={handleParentConsentChange}
                    />
                  </div>
                </div>

                <div className="col-12">
                  <div className="mb-3">
                    <label className="form-label">Sudska instanca</label>
                    <input
                      type="text"
                      className="form-control"
                      name="sudskaInstanca"
                      value={parentConsent.sudskaInstanca}
                      onChange={handleParentConsentChange}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="col-12">
                <div className="alert alert-success">
                  <i className="bi bi-check-circle me-2"></i>
                  Kandidat je punoletan, saglasnost roditelja nije potrebna.
                </div>
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="row">
            <div className="col-12">
              <h4 className="mb-4">
                <i className="bi bi-person-check me-2"></i>
                Ovlašćeno lice
              </h4>
            </div>
            
            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Ime *</label>
                <input
                  type="text"
                  className="form-control"
                  name="ime"
                  value={authorizedPerson.ime}
                  onChange={handleAuthorizedPersonChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Prezime *</label>
                <input
                  type="text"
                  className="form-control"
                  name="prezime"
                  value={authorizedPerson.prezime}
                  onChange={handleAuthorizedPersonChange}
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">JMBG *</label>
                <input
                  type="text"
                  className="form-control"
                  name="jmbg"
                  value={authorizedPerson.jmbg}
                  onChange={handleAuthorizedPersonChange}
                  maxLength="13"
                  required
                />
              </div>
            </div>

            <div className="col-md-6">
              <div className="mb-3">
                <label className="form-label">Kontakt telefon *</label>
                <input
                  type="tel"
                  className="form-control"
                  name="kontaktTelefon"
                  value={authorizedPerson.kontaktTelefon}
                  onChange={handleAuthorizedPersonChange}
                  required
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-lg-10">
          <div className="card shadow">
            <div className="card-header bg-primary text-white">
              <h3 className="mb-0">
                <i className="bi bi-person-plus me-2"></i>
                {candidateToEdit ? 'Izmeni kandidata' : 'Novi kandidat'}
              </h3>
              <div className="progress mt-3" style={{height: '5px'}}>
                <div 
                  className="progress-bar" 
                  style={{width: `${(currentStep / 6) * 100}%`}}
                ></div>
              </div>
            </div>

            <div className="card-body">
              {}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    {[
                      { num: 1, title: 'Osnovni podaci', icon: 'person' },
                      { num: 2, title: 'Obrazovanje', icon: 'mortarboard' },
                      { num: 3, title: 'Jezici', icon: 'translate' },
                      { num: 4, title: 'Radno iskustvo', icon: 'briefcase' },
                      { num: 5, title: 'Saglasnost roditelja', icon: 'file-text' },
                      { num: 6, title: 'Ovlašćeno lice', icon: 'person-check' }
                    ].map((step) => (
                      <div 
                        key={step.num} 
                        className={`text-center ${currentStep >= step.num ? 'text-primary' : 'text-muted'}`}
                      >
                        <div 
                          className={`rounded-circle d-inline-flex align-items-center justify-content-center ${
                            currentStep >= step.num ? 'bg-primary text-white' : 'bg-light'
                          }`}
                          style={{width: '40px', height: '40px'}}
                        >
                          <i className={`bi bi-${step.icon}`}></i>
                        </div>
                        <div className="small mt-1">{step.title}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {}
              {renderStepContent()}

              {}
              <div className="row mt-4">
                <div className="col-12">
                  <div className="d-flex justify-content-between">
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={prevStep}
                      disabled={currentStep === 1 || loading}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Prethodni korak
                    </button>

                    {currentStep < 6 ? (
                      <button 
                        type="button" 
                        className="btn btn-primary"
                        onClick={nextStep}
                        disabled={loading}
                      >
                        Sledeći korak
                        <i className="bi bi-arrow-right ms-1"></i>
                      </button>
                    ) : (
                      <button 
                        type="button" 
                        className="btn btn-success"
                        onClick={handleSubmit}
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
                            {candidateToEdit ? 'Ažuriraj' : 'Kreiraj'} kandidata
                          </>
                        )}
                      </button>
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

export default CandidateForm;
