import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MemberEditForm = ({ token, member, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [memberData, setMemberData] = useState(null);

  const [basicData, setBasicData] = useState({
    ime: '',
    prezime: '',
    jmbg: '',
    email: '',
    mobilniTelefon: '',
    fiksniTelefon: '',
    brojLicneKarte: '',
    lbo: '',
    datumRodjenja: ''
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

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    loadMemberData();
    loadAvailableLanguages();
  }, [member]);

  const loadMemberData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:3000/api/members/${member[0]}`, axiosConfig);
      const data = response.data;
      
      console.log('Loaded member data:', data);

      setBasicData({
        ime: data.basic?.Ime || member[3] || '',
        prezime: data.basic?.Prezime || member[4] || '',
        jmbg: data.basic?.JMBG || member[2] || '',
        email: data.basic?.Email || member[6] || '',
        mobilniTelefon: data.basic?.MobilniTelefon || member[7] || '',
        fiksniTelefon: data.basic?.FiksniTelefon || member[8] || '',
        brojLicneKarte: data.basic?.BrojLicneKarte || '',
        lbo: data.basic?.LBO || '',
        datumRodjenja: data.basic?.DatumRodjenja || ''
      });

      if (data.biography) {
        setBiography({
          vozackaDozvola: data.biography.VozackaDozvola === 1 || data.biography.VozackaDozvola === true,
          itVestine: data.biography.ITVestine || '',
          profilIZanimanje: data.biography.ProfilIZanimanje || '',
          neformalnoObrazovanje: data.biography.NeformalnoObrazovanje || '',
          radniStatus: data.biography.RadniStatus || 'nezaposleni'
        });
      }

      if (data.languages && data.languages.length > 0) {
        const mappedLanguages = data.languages.map(lang => ({
          straniJezikID: lang.StraniJezikID || lang.straniJezikID,
          nivoZnanja: lang.NivoZnanja || lang.nivoZnanja,
          languageName: lang.NazivJezika || lang.nazivJezika
        }));
        setLanguageSkills(mappedLanguages);
      }

      setMemberData(data);
    } catch (err) {
      console.error('Error loading member data:', err);
      setError('Greška pri učitavanju podataka člana');
    } finally {
      setLoading(false);
    }
  };

  const loadAvailableLanguages = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/languages', axiosConfig);
      setAvailableLanguages(response.data);
    } catch (err) {
      console.error('Greška pri učitavanju jezika:', err);
    }
  };

  const handleBasicDataChange = (e) => {
    const { name, value } = e.target;
    setBasicData(prev => ({
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

      const exists = languageSkills.some(skill => skill.straniJezikID === parseInt(newLanguageSkill.straniJezikID));
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

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const payload = {
        basicData,
        biography,
        languageSkills
      };

      console.log('Updating member with payload:', payload);

      const response = await axios.put(
        `http://localhost:3000/api/members/${member[0]}`,
        payload,
        axiosConfig
      );

      alert('Podaci člana su uspešno ažurirani!');
      onSuccess(response.data);
    } catch (err) {
      console.error('Greška pri ažuriranju člana:', err);
      setError(err.response?.data?.error || 'Greška pri ažuriranju podataka člana');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !memberData) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Učitavanje...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-10">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-pencil-square me-2"></i>
                Izmena podataka člana zadruge
              </h4>
              <p className="mb-0 mt-2">
                Član: <strong>{member[3]} {member[4]}</strong> (JMBG: {member[2]})
              </p>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {}
              <div className="row mb-4">
                <div className="col-12">
                  <h5 className="text-primary mb-3">
                    <i className="bi bi-person me-2"></i>
                    Osnovni podaci
                  </h5>
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Ime *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="ime"
                    value={basicData.ime}
                    onChange={handleBasicDataChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Prezime *</label>
                  <input
                    type="text"
                    className="form-control"
                    name="prezime"
                    value={basicData.prezime}
                    onChange={handleBasicDataChange}
                    required
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    name="email"
                    value={basicData.email}
                    onChange={handleBasicDataChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Mobilni telefon</label>
                  <input
                    type="text"
                    className="form-control"
                    name="mobilniTelefon"
                    value={basicData.mobilniTelefon}
                    onChange={handleBasicDataChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Fiksni telefon</label>
                  <input
                    type="text"
                    className="form-control"
                    name="fiksniTelefon"
                    value={basicData.fiksniTelefon}
                    onChange={handleBasicDataChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">Broj lične karte</label>
                  <input
                    type="text"
                    className="form-control"
                    name="brojLicneKarte"
                    value={basicData.brojLicneKarte}
                    onChange={handleBasicDataChange}
                  />
                </div>

                <div className="col-md-6 mb-3">
                  <label className="form-label">LBO</label>
                  <input
                    type="text"
                    className="form-control"
                    name="lbo"
                    value={basicData.lbo}
                    onChange={handleBasicDataChange}
                  />
                </div>
              </div>

              {}
              <div className="row mb-4">
                <div className="col-12">
                  <h5 className="text-primary mb-3">
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
                  <h5 className="text-primary mb-3">
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
                    <h6>Trenutni jezici:</h6>
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
            </div>

            <div className="card-footer d-flex justify-content-between">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onCancel}
                disabled={loading}
              >
                <i className="bi bi-x-circle me-1"></i>
                Otkaži
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Ažuriram...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    Sačuvaj izmene
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberEditForm;
