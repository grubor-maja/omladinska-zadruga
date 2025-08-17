import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

const WorkerRequestModal = ({ show, onHide, request, companies, onSave }) => {
  const [formData, setFormData] = useState({
    napomena: '',
    radnoVreme: '',
    profilIZanimanje: '',
    datumZahteva: '',
    periodObracuna: '',
    tipCeneRada: '',
    opisCeneRada: '',
    pib: ''
  });
  const [workerStructures, setWorkerStructures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error,   setError] = useState('');
  const token = localStorage.getItem('token');

  const axiosConfig = useMemo(
    () => ({ headers: { Authorization: `Bearer ${token}` } }),
    [token]
  );

  const toISO = (v) => {
    if (!v) return '';
    const d = new Date(v);
    return isNaN(d) ? '' : d.toISOString().split('T')[0];
  };

  const mapStructures = (rows) =>
    (rows || []).map((r) =>
      Array.isArray(r)
        ? { brojRadnika: Number(r[1]) || '', pol: r[2] || 'M' }
        : { brojRadnika: (r.brojRadnika ?? '') === '' ? '' : Number(r.brojRadnika), pol: r.pol || 'M' }
    );

  useEffect(() => {
    if (!show) return;
    if (request) {
      setFormData({
        napomena: request.napomena || '',
        radnoVreme: request.radnoVreme || '',
        profilIZanimanje: request.profilIZanimanje || '',
        datumZahteva: toISO(request.datumZahteva) || '',
        periodObracuna: request.periodObracuna || '',
        tipCeneRada: request.tipCeneRada || '',
        opisCeneRada: request.opisCeneRada || '',
        pib: request.pib || ''
      });
      if (request.id) fetchWorkerStructures(request.id);
    } else {
      setFormData({
        napomena: '',
        radnoVreme: '',
        profilIZanimanje: '',
        datumZahteva: new Date().toISOString().split('T')[0],
        periodObracuna: '',
        tipCeneRada: '',
        opisCeneRada: '',
        pib: ''
      });
      setWorkerStructures([]);
    }
    setError('');

  }, [request, show]);

  const fetchWorkerStructures = async (zahtevId) => {
    try {
      const res = await axios.get(
        `http://localhost:3000/api/worker-structures/request/${zahtevId}`,
        axiosConfig
      );
      setWorkerStructures(mapStructures(res.data));
    } catch (err) {
      console.error('Greška pri učitavanju strukture radnika:', err);
    }
  };

  const BROJ_OPCIJE = Array.from({ length: 50 }, (_, i) => i + 1);

  const addWorkerStructure = () => {
    setWorkerStructures((prev) => [...prev, { pol: 'M', brojRadnika: '' }]); 
  };

  const updateWorkerStructure = (index, field, value) => {
    setWorkerStructures((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]:
          field === 'brojRadnika'
            ? (value === '' ? '' : Number(value))
            : value
      };
      return updated;
    });
  };

  const removeWorkerStructure = (index) => {
    setWorkerStructures((prev) => prev.filter((_, i) => i !== index));
  };

  const isRowValid = (s) =>
    (s.pol === 'M' || s.pol === 'Z') && Number(s.brojRadnika) > 0;

  const structuresInvalid = useMemo(
    () => workerStructures.length === 0 || workerStructures.some((s) => !isRowValid(s)),
    [workerStructures]
  );

  const saveWorkerStructures = async (zahtevId) => {
    if (structuresInvalid) {
      throw new Error('Za svaku strukturu izaberite pol i broj (≥1).');
    }

    if (request && request.id) {
      await axios.delete(
        `http://localhost:3000/api/worker-structures/request/${zahtevId}`,
        axiosConfig
      );
    }

    for (const s of workerStructures) {
      await axios.post(
        'http://localhost:3000/api/worker-structures',
        { zahtevId, brojRadnika: Number(s.brojRadnika), pol: s.pol },
        axiosConfig
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let zahtevId;

      if (request) {
        await axios.put(
          `http://localhost:3000/api/worker-requests/${request.id}`,
          formData,
          axiosConfig
        );
        zahtevId = request.id;
        alert('Zahtev je uspešno ažuriran!');
      } else {
        const response = await axios.post(
          'http://localhost:3000/api/worker-requests',
          formData,
          axiosConfig
        );
        zahtevId = response.data.zahtevId;
        alert('Zahtev je uspešno kreiran!');
      }

      if (workerStructures.length > 0) {
        await saveWorkerStructures(zahtevId);
      }

      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-briefcase me-2"></i>
              {request ? 'Izmeni zahtev za radnicima' : 'Dodaj novi zahtev za radnicima'}
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
                    <label className="form-label"><i className="bi bi-building me-1"></i>Kompanija *</label>
                    <select
                      className="form-select"
                      name="pib"
                      value={formData.pib}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Izaberi kompaniju...</option>
                      {companies.map((c, idx) => (
                        <option key={idx} value={c[0]}>{c[1]} (PIB: {c[0]})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-calendar me-1"></i>Datum zahteva *</label>
                    <input
                      type="date"
                      className="form-control"
                      name="datumZahteva"
                      value={formData.datumZahteva}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-person-workspace me-1"></i>Profil/Zanimanje *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="profilIZanimanje"
                      value={formData.profilIZanimanje}
                      onChange={handleChange}
                      required
                      placeholder="npr. IT stručnjak, Prodavac..."
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-clock me-1"></i>Radno vreme *</label>
                    <input
                      type="text"
                      className="form-control"
                      name="radnoVreme"
                      value={formData.radnoVreme}
                      onChange={handleChange}
                      required
                      placeholder="npr. 09:00-17:00"
                    />
                  </div>
                </div>
              </div>

              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-calendar-range me-1"></i>Period obračuna *</label>
                    <select
                      className="form-select"
                      name="periodObracuna"
                      value={formData.periodObracuna}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Izaberi period...</option>
                      <option value="dnevni">Dnevni</option>
                      <option value="nedeljni">Nedeljni</option>
                      <option value="mesecni">Mesečni</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label"><i className="bi bi-currency-dollar me-1"></i>Tip cene rada *</label>
                    <select
                      className="form-select"
                      name="tipCeneRada"
                      value={formData.tipCeneRada}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Izaberi tip...</option>
                      <option value="satnica">Satnica</option>
                      <option value="dnevnica">Dnevnica</option>
                      <option value="mesecno">Mesečno</option>
                      <option value="akord">Akord</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label"><i className="bi bi-info-circle me-1"></i>Opis cene rada</label>
                <input
                  type="text"
                  className="form-control"
                  name="opisCeneRada"
                  value={formData.opisCeneRada}
                  onChange={handleChange}
                  placeholder="npr. 500 RSD/h, 4000 RSD/dan..."
                />
              </div>

              <div className="mb-3">
                <label className="form-label"><i className="bi bi-sticky me-1"></i>Napomena</label>
                <textarea
                  className="form-control"
                  name="napomena"
                  value={formData.napomena}
                  onChange={handleChange}
                  rows="3"
                  placeholder="Dodatne informacije o zahtevu..."
                />
              </div>

              {}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <label className="form-label mb-0"><i className="bi bi-people me-1"></i>Struktura radnika</label>
                  <button type="button" className="btn btn-sm btn-success" onClick={addWorkerStructure}>
                    <i className="bi bi-plus-circle me-1"></i>Dodaj strukturu
                  </button>
                </div>

                {workerStructures.length > 0 ? (
                  <div className="border rounded p-3">
                    {workerStructures.map((s, idx) => {
                      const invalidBroj = !(Number(s.brojRadnika) > 0);
                      return (
                        <div key={idx} className="row align-items-center mb-2">
                          <div className="col-md-4">
                            <label className="form-label small">Pol *</label>
                            <select
                              className="form-select"
                              value={s.pol}
                              onChange={(e) => updateWorkerStructure(idx, 'pol', e.target.value)}
                              required
                            >
                              <option value="M">Muški</option>
                              <option value="Z">Ženski</option>
                            </select>
                          </div>

                          <div className="col-md-4">
                            <label className="form-label small">Broj *</label>
                            <select
                              className={`form-select ${invalidBroj ? 'is-invalid' : ''}`}
                              value={s.brojRadnika === '' ? '' : String(s.brojRadnika)}
                              onChange={(e) => updateWorkerStructure(idx, 'brojRadnika', e.target.value)}
                              required
                            >
                              <option value="">Izaberi broj…</option>
                              {BROJ_OPCIJE.map((n) => (
                                <option key={n} value={n}>{n}</option>
                              ))}
                            </select>
                            {invalidBroj && <div className="invalid-feedback">Obavezan izbor broja.</div>}
                          </div>

                          <div className="col-md-4 d-flex align-items-end">
                            <button
                              type="button"
                              className="btn btn-sm btn-danger"
                              onClick={() => removeWorkerStructure(idx)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>

                          {idx < workerStructures.length - 1 && <hr className="my-2" />}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-muted text-center py-3">
                    <i className="bi bi-info-circle me-2"></i>Nema dodanih struktura radnika
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide} disabled={loading}>
                Otkaži
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || structuresInvalid}
                title={structuresInvalid ? 'Dodajte bar jednu strukturu radnika sa brojem ≥1' : ''}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Čuva se...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    {request ? 'Ažuriraj' : 'Kreiraj'} zahtev
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

export default WorkerRequestModal;
