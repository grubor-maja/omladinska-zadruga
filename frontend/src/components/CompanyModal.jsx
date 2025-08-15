import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CompanyModal = ({ show, onHide, company, onSave }) => {
  const [formData, setFormData] = useState({
    pib: '',
    naziv: '',
    mejl: '',
    mobilni: '',
    fiksni: '',
    maticniBroj: '',
    tekuciRacun: '',
    sifraDelatnosti: '',
    adresaID: ''
  });
  const [createContract, setCreateContract] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const ZAPOSLENI_ID = 1;

  useEffect(() => {
    if (company) {
      setFormData({
        pib: company.pib || '',
        naziv: company.naziv || '',
        mejl: company.mejl || '',
        mobilni: company.mobilni || '',
        fiksni: company.fiksni || '',
        maticniBroj: company.maticniBroj || '',
        tekuciRacun: company.tekuciRacun || '',
        sifraDelatnosti: company.sifraDelatnosti || '',
        adresaID: company.adresaID || ''
      });
    } else {
      setFormData({
        pib: '',
        naziv: '',
        mejl: '',
        mobilni: '',
        fiksni: '',
        maticniBroj: '',
        tekuciRacun: '',
        sifraDelatnosti: '',
        adresaID: ''
      });
    }
    setError('');
    setCreateContract(false);
  }, [company, show]);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/addresses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAddresses(res.data);
    } catch (err) {
      console.error('Greška pri učitavanju adresa:', err);
    }
  };

  useEffect(() => {
    fetchAddresses();

  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const axiosConfig = { headers: { Authorization: `Bearer ${token}` } };

      if (company) {
        await axios.put(
          `http://localhost:3000/api/companies/${company.pib}`,
          formData,
          axiosConfig
        );
        alert('Kompanija je uspešno ažurirana!');
      } else {
        if (createContract) {

          await axios.post(
            'http://localhost:3000/api/companies/with-contract',
            { ...formData, zaposleniId: ZAPOSLENI_ID },
            axiosConfig
          );
          alert('Kompanija i generalni ugovor su uspešno kreirani!');
        } else {
          await axios.post('http://localhost:3000/api/companies', formData, axiosConfig);
          alert('Kompanija je uspešno kreirana!');
        }
      }

      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-building me-2"></i>
              {company ? 'Izmeni kompaniju' : 'Dodaj novu kompaniju'}
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

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-hash me-1"></i>PIB *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="pib"
                      value={formData.pib}
                      onChange={handleChange}
                      placeholder="123456789"
                      maxLength="9"
                      required
                      disabled={!!company}
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-building me-1"></i>Naziv kompanije *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="naziv"
                      value={formData.naziv}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-envelope me-1"></i>Email</label>
                    <input type="email" className="form-control" name="mejl" value={formData.mejl} onChange={handleChange}/>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-phone me-1"></i>Mobilni telefon</label>
                    <input type="tel" className="form-control" name="mobilni" value={formData.mobilni} onChange={handleChange} placeholder="06x xxxxxxx"/>
                  </div>
                </div>

                <div className="col-md-4">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-telephone me-1"></i>Fiksni telefon</label>
                    <input type="tel" className="form-control" name="fiksni" value={formData.fiksni} onChange={handleChange} placeholder="011 xxxxxxx"/>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-file-text me-1"></i>Matični broj</label>
                    <input type="text" className="form-control" name="maticniBroj" value={formData.maticniBroj} onChange={handleChange} maxLength="8"/>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-bank me-1"></i>Tekući račun</label>
                    <input type="text" className="form-control" name="tekuciRacun" value={formData.tekuciRacun} onChange={handleChange}/>
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-briefcase me-1"></i>Šifra delatnosti</label>
                    <input type="text" className="form-control" name="sifraDelatnosti" value={formData.sifraDelatnosti} onChange={handleChange}/>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-geo-alt me-1"></i>Adresa</label>
                    <select className="form-select" name="adresaID" value={formData.adresaID} onChange={handleChange}>
                      <option value="">Izaberite adresu</option>
                      {addresses.map((a) => (
                        <option key={a[0]} value={a[0]}>
                          {a[1]} {a[2]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {!company && (
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="card border-info">
                      <div className="card-header bg-info text-white">
                        <h6 className="mb-0"><i className="bi bi-file-earmark-text me-2"></i>Generalni ugovor (opciono)</h6>
                      </div>
                      <div className="card-body">
                        <div className="form-check mb-3">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="createContract"
                            checked={createContract}
                            onChange={(e) => setCreateContract(e.target.checked)}
                          />
                          <label className="form-check-label" htmlFor="createContract">
                            Kreiraj generalni ugovor sa zaposlenim (ID 1)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide} disabled={loading}>Otkaži</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (<><span className="spinner-border spinner-border-sm me-2"></span>Čuva se...</>) : (<><i className="bi bi-check-circle me-1"></i>{company ? 'Ažuriraj' : 'Kreiraj'} kompaniju</>)}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyModal;
