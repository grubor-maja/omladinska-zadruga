import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const SimpleCandidateForm = ({ token, onSuccess, onCancel, candidateId }) => {
  const isEdit = !!candidateId;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [basicData, setBasicData] = useState({
    jmbg: '',
    ime: '',
    prezime: '',
    datumRodjenja: '',
    mobilniTelefon: '',
    fiksniTelefon: '',
    email: '',
    brojLicneKarte: '',
    lbo: ''
  });

  const [additionalData, setAdditionalData] = useState({
    privremeniBoravak: '',
    sklonostKaPoslovima: '',
    brojTekucegRacuna: ''
  });

  const [education, setEducation] = useState({
    obrazovnaUstanovaID: '',
    nazivUstanove: '',
    tipObrazovanja: '',
    zvanje: ''
  });

  const [educationalInstitutions, setEducationalInstitutions] = useState([]); 
  const [foreignLanguages, setForeignLanguages] = useState([]); 
  const [instLoading, setInstLoading] = useState(false);
  const [instError, setInstError] = useState('');

  const [addresses, setAddresses] = useState([]);

  const [validationErrors, setValidationErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({}); 

  const axiosConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const digitsOnly = (v) => (v || '').replace(/\D/g, '');
  const normalizePhone = (v) => digitsOnly(v);

  const isValidMobile = (d) => /^06\d{7,8}$/.test(d); // 06 + 7–8 = 9–10 cifara
  const isValidFixed  = (d) => /^0\d{8,9}$/.test(d);  // 0  + 8–9 = 9–10 cifara

  const setErrorFor = (name, msg) =>
    setValidationErrors((prev) => ({ ...prev, [name]: msg || '' }));

  const needLen = (label, got, need) =>
    `${label} mora imati tačno ${need} cifara (trenutno ${got}/${need}).`;

  const validateField = (name, rawValue) => {
    const value = (rawValue ?? '').toString().trim();
    let msg = '';

    switch (name) {
      case 'jmbg': {
        const d = digitsOnly(value);
        if (!d) msg = 'JMBG je obavezan';
        else if (d.length !== 13) msg = needLen('JMBG', d.length, 13);
        break;
      }
      case 'ime':
      case 'prezime': {
        if (!value) msg = 'Polje je obavezno';
        else if (value.length < 2) msg = 'Mora imati najmanje 2 karaktera';
        break;
      }
      case 'datumRodjenja': {
        if (!value) msg = 'Datum rođenja je obavezan';
        break;
      }
      case 'email': {
        if (value) {
          const re = /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!re.test(value)) msg = 'Email adresa nije validna';
        }
        break;
      }
      case 'brojLicneKarte': {
        if (value) {
          const d = digitsOnly(value);
          if (d.length !== 9) msg = needLen('Broj lične karte', d.length, 9);
        }
        break;
      }
      case 'lbo': {
        if (value) {
          const d = digitsOnly(value);
          if (d.length !== 11) msg = needLen('LBO', d.length, 11);
        }
        break;
      }
      case 'mobilniTelefon': {
        if (value) {
          const d = normalizePhone(value);
          if (!isValidMobile(d)) {
            msg = `Mobilni treba da počinje sa 06 i ima ukupno 9–10 cifara. Uneto ${d.length}.`;
          }
        }
        break;
      }
      case 'fiksniTelefon': {
        if (value) {
          const d = normalizePhone(value);
          if (!isValidFixed(d)) {
            msg = `Fiksni treba da počinje sa 0 i ima ukupno 9–10 cifara. Uneto ${d.length}.`;
          }
        }
        break;
      }
      default:
        break;
    }

    setErrorFor(name, msg);
    return !msg;
  };

  const validatePhoneGroup = () => {
    const mob = basicData.mobilniTelefon.trim();
    const fix = basicData.fiksniTelefon.trim();
    const msg = (!mob && !fix) ? 'Potreban je bar jedan broj telefona (mobilni ili fiksni).' : '';
    setErrorFor('phones', msg);
    return !msg;
  };

  useEffect(() => {
    (async () => {
      try {
        setInstLoading(true);
        setInstError('');

        const institutionsRes = await axios.get('http://localhost:3000/api/institutions', axiosConfig);
        
        const institutions = Array.isArray(institutionsRes.data) ? institutionsRes.data : [];
        const normalizedInst = institutions.map((it) =>
          Array.isArray(it)
            ? { id: it[0], naziv: it[1] }
            : { id: it.ObrazovnaUstanovaID, naziv: it.NazivObrazovneUstanove }
        );
        setEducationalInstitutions(normalizedInst);

      } catch (err) {
        console.error('Greška pri učitavanju podataka:', err);
        setInstError('Neuspešno učitavanje podataka.');
      } finally {
        setInstLoading(false);
      }
    })();
  }, [axiosConfig]);

  useEffect(() => {
    if (touchedFields.mobilniTelefon || touchedFields.fiksniTelefon) {
      validatePhoneGroup();
      if (touchedFields.mobilniTelefon) {
        validateField('mobilniTelefon', basicData.mobilniTelefon);
      }
      if (touchedFields.fiksniTelefon) {
        validateField('fiksniTelefon', basicData.fiksniTelefon);
      }
    }

  }, [basicData.mobilniTelefon, basicData.fiksniTelefon, touchedFields.mobilniTelefon, touchedFields.fiksniTelefon]);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await axios.get(`http://localhost:3000/api/candidates/${candidateId}`, axiosConfig);
        const row = res.data;

        const pick = (obj, idx, ...keys) => {
          if (Array.isArray(obj)) return obj[idx] ?? '';
          for (const k of keys) {
            if (obj[k] !== undefined && obj[k] !== null) return obj[k];
          }
          return '';
        };

        const dobRaw = pick(row, 4, 'DATUMRODJENJA', 'DatumRodjenja');
        const dobIso = dobRaw ? new Date(dobRaw).toISOString().slice(0, 10) : '';

        setBasicData({
          jmbg:           row.jmbg || '',
          ime:            row.ime || '',
          prezime:        row.prezime || '',
          datumRodjenja:  row.datumRodjenja ? new Date(row.datumRodjenja).toISOString().slice(0, 10) : '',
          email:          row.email || '',
          mobilniTelefon: row.telefon || '', 
          fiksniTelefon:  '', 
          brojLicneKarte: row.brojLicneKarte || '',
          lbo:            row.lbo || ''
        });

        const edu = row?.education || null;
        if (edu) {
          setEducation({
            obrazovnaUstanovaID: (edu.obrazovnaUstanovaID ?? '').toString(),
            nazivUstanove: edu.nazivObrazovneUstanove || '',
            tipObrazovanja: edu.stepenStudija || '',
            zvanje: edu.zvanje || ''
          });
        }

        setAdditionalData({
          privremeniBoravak: row.privremeniBoravak || '',
          sklonostKaPoslovima: row.sklonostKaPoslovima || '',
          brojTekucegRacuna: row.brojTekucegRacuna || ''
        });

      } catch (e) {
        console.error('Greška pri čitanju kandidata:', e);
      }
    })();
  }, [isEdit, candidateId, axiosConfig]);

  useEffect(() => {
    (async () => {
      try {
        const addressesRes = await axios.get('http://localhost:3000/api/addresses', axiosConfig);
        setAddresses(addressesRes.data);
      } catch (err) {
        console.error('Greška pri učitavanju adresa:', err);
      }
    })();
  }, [axiosConfig]);

  const handleBasicDataChange = (e) => {
    const { name, value } = e.target;
    let next = value;

    if (name === 'jmbg' || name === 'brojLicneKarte' || name === 'lbo') {
      next = digitsOnly(value);
    } else if (name === 'mobilniTelefon' || name === 'fiksniTelefon') {
      next = value.replace(/\s+/g, ' ').trimStart();
    } else if (name === 'email') {
      next = value.trim();
    } else {
      next = value.replace(/^\s+/, '');
    }

    setBasicData((prev) => ({ ...prev, [name]: next }));

    setTouchedFields(prev => ({ ...prev, [name]: true }));

    validateField(name, next);
    if (name === 'mobilniTelefon' || name === 'fiksniTelefon') validatePhoneGroup();
  };

  const handleAdditionalDataChange = (e) => {
    const { name, value } = e.target;
    const next = name === 'brojTekucegRacuna' ? value.trim() : value.replace(/^\s+/, '');
    setAdditionalData((prev) => ({ ...prev, [name]: next }));
  };

  const handleEducationChange = (e) => {
    const { name, value } = e.target;
    setEducation((prev) => ({ ...prev, [name]: value }));
  };

  const addLanguage = () => {

  };

  const removeLanguage = (index) => {

  };

  const handleLanguageChange = (e) => {

  };

  const handleInstitutionSelect = async (e) => {
    const selectedId = e.target.value;
    const sel = educationalInstitutions.find((inst) => String(inst.id) === String(selectedId));

    setEducation((prev) => ({
      ...prev,
      obrazovnaUstanovaID: selectedId || '',
      nazivUstanove: sel ? sel.naziv : ''
    }));

    if (isEdit && selectedId) {
      try {
        await axios.post(
          'http://localhost:3000/api/education',
          {
            kandidatID: candidateId,
            obrazovnaUstanovaID: Number(selectedId),
            tipObrazovanja: education.tipObrazovanja || null,
            zvanje: education.zvanje || null
          },
          axiosConfig
        );
      } catch (err) {
        console.error('Greška pri upisu obrazovanja:', err);
        setInstError('Nije uspelo snimanje obrazovanja.');
      }
    }
  };

  const isFormValid =
    basicData.jmbg && !validationErrors.jmbg &&
    basicData.ime && !validationErrors.ime &&
    basicData.prezime && !validationErrors.prezime &&
    basicData.datumRodjenja && !validationErrors.datumRodjenja &&
    !validationErrors.phones &&
    (!basicData.email || !validationErrors.email) &&
    (!basicData.brojLicneKarte || !validationErrors.brojLicneKarte) &&
    (!basicData.lbo || !validationErrors.lbo) &&
    (
      (!!basicData.mobilniTelefon && !validationErrors.mobilniTelefon) ||
      (!!basicData.fiksniTelefon && !validationErrors.fiksniTelefon)
    );

  const validateFormBeforeSubmit = () => {
    ['jmbg','ime','prezime','datumRodjenja','email','brojLicneKarte','lbo','mobilniTelefon','fiksniTelefon']
      .forEach((f) => validateField(f, basicData[f]));
    validatePhoneGroup();
    return isFormValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateFormBeforeSubmit()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoading(true);
    setError('');

    try {
      const onlyDigits = (s) => (s ? s.replace(/\D/g, '') : null);

      const payload = {

        jmbg: onlyDigits(basicData.jmbg),
        ime: basicData.ime,
        prezime: basicData.prezime,
        datumRodjenja: basicData.datumRodjenja,
        telefon: basicData.mobilniTelefon ? onlyDigits(basicData.mobilniTelefon) : null,
        email: basicData.email ? basicData.email.trim() : null,
        brojLicneKarte: basicData.brojLicneKarte ? onlyDigits(basicData.brojLicneKarte) : null,
        lbo: basicData.lbo ? onlyDigits(basicData.lbo) : null,

        privremeniBoravak: additionalData.privremeniBoravak || null,
        sklonostKaPoslovima: additionalData.sklonostKaPoslovima || null,
        brojTekucegRacuna: additionalData.brojTekucegRacuna ? additionalData.brojTekucegRacuna.trim() : null,

        education: education.obrazovnaUstanovaID ? {
          obrazovnaUstanovaID: education.obrazovnaUstanovaID,
          nazivUstanove: education.nazivUstanove,
          stepenStudija: education.tipObrazovanja || null,
          zvanje: education.zvanje || null
        } : null
      };

      let response;
      if (isEdit) {

        response = await axios.put(
          `http://localhost:3000/api/candidates/${candidateId}`,
          payload,
          axiosConfig
        );
      } else {
        response = await axios.post(
          'http://localhost:3000/api/candidates',
          payload,
          axiosConfig
        );
      }

      alert(isEdit ? 'Kandidat je uspešno ažuriran!' : 'Kandidat je uspešno kreiran!');
      onSuccess(response.data);
    } catch (err) {
      console.error('Greška pri snimanju kandidata:', err);
      setError(err.response?.data?.error || 'Greška pri snimanju kandidata');
    } finally {
      setLoading(false);
    }
  };

  const err = (k) => touchedFields[k] ? validationErrors[k] : '';

  const countHint = (value, need, label) => {
    const d = digitsOnly(value);
    if (!d) return null;
    if (d.length === need) return <div className="form-text text-success">{label}: {d.length}/{need}</div>;
    return <div className="form-text">{label}: {d.length}/{need}</div>;
  };

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">
                <i className="bi bi-person-plus me-2"></i>
                {isEdit ? 'Izmena kandidata' : 'Kreiranje kandidata'}
              </h4>
            </div>

            <div className="card-body">
              {error && (
                <div className="alert alert-danger" role="alert" aria-live="polite">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-person me-2"></i>
                      Osnovni podaci
                    </h5>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">JMBG *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`form-control ${err('jmbg') ? 'is-invalid' : ''}`}
                      name="jmbg"
                      value={basicData.jmbg}
                      onChange={handleBasicDataChange}
                      maxLength={13}
                      required
                    />
                    {err('jmbg') ? (
                      <div className="invalid-feedback">{err('jmbg')}</div>
                    ) : (
                      countHint(basicData.jmbg, 13, 'JMBG')
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Ime *</label>
                    <input
                      type="text"
                      className={`form-control ${err('ime') ? 'is-invalid' : ''}`}
                      name="ime"
                      value={basicData.ime}
                      onChange={handleBasicDataChange}
                      required
                    />
                    {err('ime') && <div className="invalid-feedback">{err('ime')}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Prezime *</label>
                    <input
                      type="text"
                      className={`form-control ${err('prezime') ? 'is-invalid' : ''}`}
                      name="prezime"
                      value={basicData.prezime}
                      onChange={handleBasicDataChange}
                      required
                    />
                    {err('prezime') && <div className="invalid-feedback">{err('prezime')}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Datum rođenja *</label>
                    <input
                      type="date"
                      className={`form-control ${err('datumRodjenja') ? 'is-invalid' : ''}`}
                      name="datumRodjenja"
                      value={basicData.datumRodjenja}
                      onChange={handleBasicDataChange}
                      required
                    />
                    {err('datumRodjenja') && <div className="invalid-feedback">{err('datumRodjenja')}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Mobilni telefon</label>
                    <input
                      type="tel"
                      className={`form-control ${err('mobilniTelefon') || err('phones') ? 'is-invalid' : ''}`}
                      name="mobilniTelefon"
                      value={basicData.mobilniTelefon}
                      onChange={handleBasicDataChange}
                      placeholder="npr. 060 123 4567 ili 060-123-4567"
                    />
                    {err('mobilniTelefon') ? (
                      <div className="invalid-feedback">{err('mobilniTelefon')}</div>
                    ) : (
                      <div className={`form-text ${err('phones') ? 'text-danger' : ''}`}>
                        Razmaci/crtice/tačke su dozvoljeni. Validacija ide nad ciframa.
                      </div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Fiksni telefon</label>
                    <input
                      type="tel"
                      className={`form-control ${err('fiksniTelefon') || err('phones') ? 'is-invalid' : ''}`}
                      name="fiksniTelefon"
                      value={basicData.fiksniTelefon}
                      onChange={handleBasicDataChange}
                      placeholder="npr. 011 234 5678 ili 021-234-567"
                    />
                    {err('fiksniTelefon') ? (
                      <div className="invalid-feedback">{err('fiksniTelefon')}</div>
                    ) : err('phones') ? (
                      <div className="invalid-feedback d-block">{err('phones')}</div>
                    ) : (
                      <div className="form-text">Bar jedan telefon je obavezan.</div>
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className={`form-control ${err('email') ? 'is-invalid' : ''}`}
                      name="email"
                      value={basicData.email}
                      onChange={handleBasicDataChange}
                    />
                    {err('email') && <div className="invalid-feedback">{err('email')}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Broj lične karte</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`form-control ${err('brojLicneKarte') ? 'is-invalid' : ''}`}
                      name="brojLicneKarte"
                      value={basicData.brojLicneKarte}
                      onChange={handleBasicDataChange}
                      maxLength={9}
                    />
                    {err('brojLicneKarte') ? (
                      <div className="invalid-feedback">{err('brojLicneKarte')}</div>
                    ) : (
                      countHint(basicData.brojLicneKarte, 9, 'Broj LK')
                    )}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">LBO</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className={`form-control ${err('lbo') ? 'is-invalid' : ''}`}
                      name="lbo"
                      value={basicData.lbo}
                      onChange={handleBasicDataChange}
                      maxLength={11}
                    />
                    {err('lbo') ? (
                      <div className="invalid-feedback">{err('lbo')}</div>
                    ) : (
                      countHint(basicData.lbo, 11, 'LBO')
                    )}
                  </div>
                </div>

                {}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-info-circle me-2"></i>
                      Dodatni podaci
                    </h5>
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Privremeni boravak</label>
                    <select 
                      className="form-select" 
                      name="privremeniBoravak" 
                      value={additionalData.privremeniBoravak} 
                      onChange={handleAdditionalDataChange}
                    >
                      <option value="">Izaberite adresu</option>
                      {addresses.map((address) => (
                        <option key={address[0]} value={`${address[1]} ${address[2]}, ${address[5]} ${address[4]}`}>
                          {address[1]} {address[2]}, {address[5]} {address[4]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-12 mb-3">
                    <label className="form-label">Sklonost ka poslovima</label>
                    <textarea
                      className="form-control"
                      name="sklonostKaPoslovima"
                      value={additionalData.sklonostKaPoslovima}
                      onChange={handleAdditionalDataChange}
                      rows="3"
                      placeholder="Opišite sklonosti"
                    />
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Broj tekućeg računa</label>
                    <input
                      type="text"
                      className="form-control"
                      name="brojTekucegRacuna"
                      value={additionalData.brojTekucegRacuna}
                      onChange={handleAdditionalDataChange}
                      placeholder="xxx-xxxxxxxxxxxx-xx"
                    />
                  </div>
                </div>

                {}
                <div className="row mb-4">
                  <div className="col-12">
                    <h5 className="text-primary mb-3">
                      <i className="bi bi-mortarboard me-2"></i>
                      Obrazovanje (opciono)
                    </h5>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Obrazovna ustanova</label>
                    <select
                      className="form-select"
                      value={education.obrazovnaUstanovaID}
                      onChange={handleInstitutionSelect}
                      disabled={instLoading}
                    >
                      <option value="">Izaberite ustanovu</option>
                      {educationalInstitutions.map((inst) => (
                        <option key={inst.id} value={inst.id}>
                          {inst.naziv}
                        </option>
                      ))}
                    </select>
                    {instError && <div className="form-text text-danger">{instError}</div>}
                    {instLoading && <div className="form-text">Učitavanje ustanova…</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Tip obrazovanja</label>
                    <select
                      className="form-select"
                      name="tipObrazovanja"
                      value={education.tipObrazovanja}
                      onChange={handleEducationChange}
                    >
                      <option value="">Izaberite tip</option>
                      <option value="Osnovno">Osnovno</option>
                      <option value="Srednje">Srednje</option>
                      <option value="Više">Više</option>
                      <option value="Visoko">Visoko</option>
                      <option value="Master">Master</option>
                      <option value="Doktorat">Doktorat</option>
                    </select>
                  </div>

                  <div className="col-12 mb-3">
                    <label className="form-label">Zvanje/Smer</label>
                    <input
                      type="text"
                      className="form-control"
                      name="zvanje"
                      value={education.zvanje}
                      onChange={handleEducationChange}
                      placeholder="Npr. Ekonomista, Tehničar..."
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
                      className="btn btn-primary"
                      disabled={loading || !isFormValid}
                      title={!isFormValid ? 'Proverite crveno označena polja' : undefined}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          {isEdit ? 'Ažuriranje...' : 'Kreiranje...'}
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-circle me-1"></i>
                          {isEdit ? 'Sačuvaj izmene' : 'Kreiraj kandidata'}
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

export default SimpleCandidateForm;
