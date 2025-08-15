import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddressManagement = ({ token }) => {
  const [addresses, setAddresses] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('cities');
  const [error, setError] = useState('');

  const [cityModal, setCityModal] = useState({ show: false, city: null });
  const [municipalityModal, setMunicipalityModal] = useState({ show: false, municipality: null, selectedCityId: '' });
  const [addressModal, setAddressModal] = useState({ show: false, address: null, selectedMunicipalityId: '' });
  const [deleteConfirm, setDeleteConfirm] = useState({ show: false, type: '', item: null });

  const [cityForm, setCityForm] = useState({ naziv: '', postanskiBroj: '' });
  const [municipalityForm, setMunicipalityForm] = useState({ naziv: '', gradID: '' });
  const [addressForm, setAddressForm] = useState({ nazivUlice: '', broj: '', opstinaID: '' });

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [addressRes, municipalityRes, cityRes] = await Promise.all([
        axios.get('http://localhost:3000/api/addresses', axiosConfig),
        axios.get('http://localhost:3000/api/municipalities', axiosConfig),
        axios.get('http://localhost:3000/api/cities', axiosConfig)
      ]);
      
      setAddresses(addressRes.data);
      setMunicipalities(municipalityRes.data);
      setCities(cityRes.data);
    } catch (err) {
      setError('Greška pri učitavanju podataka');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCitySubmit = async (e) => {
    e.preventDefault();
    try {
      if (cityModal.city) {
        await axios.put(`http://localhost:3000/api/cities/${cityModal.city[0]}`, cityForm, axiosConfig);
        alert('Grad je uspešno ažuriran!');
      } else {
        await axios.post('http://localhost:3000/api/cities', cityForm, axiosConfig);
        alert('Grad je uspešno kreiran!');
      }
      fetchData();
      setCityModal({ show: false, city: null });
      setCityForm({ naziv: '', postanskiBroj: '' });
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleCityDelete = async (cityId) => {
    try {
      await axios.delete(`http://localhost:3000/api/cities/${cityId}`, axiosConfig);
      alert('Grad je uspešno obrisan zajedno sa svim opštinama i adresama!');
      fetchData();
      setDeleteConfirm({ show: false, type: '', item: null });
    } catch (err) {
      alert('Greška pri brisanju grada: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleMunicipalitySubmit = async (e) => {
    e.preventDefault();
    try {
      if (municipalityModal.municipality) {
        await axios.put(`http://localhost:3000/api/municipalities/${municipalityModal.municipality[0]}`, municipalityForm, axiosConfig);
        alert('Opština je uspešno ažurirana!');
      } else {
        await axios.post('http://localhost:3000/api/municipalities', municipalityForm, axiosConfig);
        alert('Opština je uspešno kreirana!');
      }
      fetchData();
      setMunicipalityModal({ show: false, municipality: null, selectedCityId: '' });
      setMunicipalityForm({ naziv: '', gradID: '' });
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleMunicipalityDelete = async (municipalityId) => {
    try {
      await axios.delete(`http://localhost:3000/api/municipalities/${municipalityId}`, axiosConfig);
      alert('Opština je uspešno obrisana zajedno sa svim adresama!');
      fetchData();
      setDeleteConfirm({ show: false, type: '', item: null });
    } catch (err) {
      alert('Greška pri brisanju opštine: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    try {
      if (addressModal.address) {
        await axios.put(`http://localhost:3000/api/addresses/${addressModal.address[0]}`, addressForm, axiosConfig);
        alert('Adresa je uspešno ažurirana!');
      } else {
        await axios.post('http://localhost:3000/api/addresses', addressForm, axiosConfig);
        alert('Adresa je uspešno kreirana!');
      }
      fetchData();
      setAddressModal({ show: false, address: null, selectedMunicipalityId: '' });
      setAddressForm({ nazivUlice: '', broj: '', opstinaID: '' });
    } catch (err) {
      alert('Greška: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleAddressDelete = async (addressId) => {
    try {
      await axios.delete(`http://localhost:3000/api/addresses/${addressId}`, axiosConfig);
      alert('Adresa je uspešno obrisana!');
      fetchData();
      setDeleteConfirm({ show: false, type: '', item: null });
    } catch (err) {
      alert('Greška pri brisanju adrese: ' + (err.response?.data?.error || err.message));
    }
  };

  const getCityName = (cityId) => {
    const city = cities.find(c => c[0] === cityId);
    return city ? city[1] : 'Nepoznat grad';
  };

  const getMunicipalityName = (municipalityId) => {
    const municipality = municipalities.find(m => m[0] === municipalityId);
    return municipality ? municipality[1] : 'Nepoznata opština';
  };

  const getAddressesByMunicipality = (municipalityId) => {
    return addresses.filter(addr => addr[3] === municipalityId);
  };

  const getMunicipalitiesByCity = (cityId) => {
    return municipalities.filter(mun => mun[2] === cityId);
  };

  const openCityModal = (city = null) => {
    if (city) {
      setCityForm({ naziv: city[1], postanskiBroj: city[2] });
      setCityModal({ show: true, city });
    } else {
      setCityForm({ naziv: '', postanskiBroj: '' });
      setCityModal({ show: true, city: null });
    }
  };

  const openMunicipalityModal = (municipality = null, cityId = '') => {
    if (municipality) {
      setMunicipalityForm({ naziv: municipality[1], gradID: municipality[2] });
      setMunicipalityModal({ show: true, municipality, selectedCityId: municipality[2] });
    } else {
      setMunicipalityForm({ naziv: '', gradID: cityId });
      setMunicipalityModal({ show: true, municipality: null, selectedCityId: cityId });
    }
  };

  const openAddressModal = (address = null, municipalityId = '') => {
    if (address) {
      setAddressForm({ nazivUlice: address[1], broj: address[2], opstinaID: address[3] });
      setAddressModal({ show: true, address, selectedMunicipalityId: address[3] });
    } else {
      setAddressForm({ nazivUlice: '', broj: '', opstinaID: municipalityId });
      setAddressModal({ show: true, address: null, selectedMunicipalityId: municipalityId });
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>
              <i className="bi bi-geo-alt me-2"></i>
              Upravljanje adresama
            </h2>
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
                className={`nav-link ${activeTab === 'cities' ? 'active' : ''}`}
                onClick={() => setActiveTab('cities')}
              >
                <i className="bi bi-building me-1"></i>
                Gradovi
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'municipalities' ? 'active' : ''}`}
                onClick={() => setActiveTab('municipalities')}
              >
                <i className="bi bi-map me-1"></i>
                Opštine
              </button>
            </li>
            <li className="nav-item">
              <button 
                className={`nav-link ${activeTab === 'addresses' ? 'active' : ''}`}
                onClick={() => setActiveTab('addresses')}
              >
                <i className="bi bi-house me-1"></i>
                Adrese
              </button>
            </li>
          </ul>

          {}
          {activeTab === 'cities' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-building me-2"></i>
                  Gradovi
                </h5>
                <button 
                  className="btn btn-primary"
                  onClick={() => openCityModal()}
                >
                  <i className="bi bi-plus me-1"></i>
                  Dodaj grad
                </button>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Naziv grada</th>
                        <th>Poštanski broj</th>
                        <th>Broj opština</th>
                        <th>Broj adresa</th>
                        <th>Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cities.map((city) => {
                        const cityMunicipalities = getMunicipalitiesByCity(city[0]);
                        const totalAddresses = cityMunicipalities.reduce((total, mun) => 
                          total + getAddressesByMunicipality(mun[0]).length, 0);
                        
                        return (
                          <tr key={city[0]}>
                            <td>{city[1]}</td>
                            <td>{city[2]}</td>
                            <td>{cityMunicipalities.length}</td>
                            <td>{totalAddresses}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => openCityModal(city)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-success me-1"
                                onClick={() => openMunicipalityModal(null, city[0])}
                              >
                                <i className="bi bi-plus"></i> Opština
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setDeleteConfirm({ show: true, type: 'city', item: city })}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'municipalities' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-map me-2"></i>
                  Opštine
                </h5>
                <div>
                  <select 
                    className="form-select d-inline-block me-2" 
                    style={{width: 'auto'}}
                    onChange={(e) => e.target.value && openMunicipalityModal(null, e.target.value)}
                    value=""
                  >
                    <option value="">Izaberite grad za dodavanje opštine</option>
                    {cities.map(city => (
                      <option key={city[0]} value={city[0]}>{city[1]}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Naziv opštine</th>
                        <th>Grad</th>
                        <th>Broj adresa</th>
                        <th>Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {municipalities.map((municipality) => {
                        const municipalityAddresses = getAddressesByMunicipality(municipality[0]);
                        
                        return (
                          <tr key={municipality[0]}>
                            <td>{municipality[1]}</td>
                            <td>{getCityName(municipality[2])}</td>
                            <td>{municipalityAddresses.length}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => openMunicipalityModal(municipality)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-success me-1"
                                onClick={() => openAddressModal(null, municipality[0])}
                              >
                                <i className="bi bi-plus"></i> Adresa
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setDeleteConfirm({ show: true, type: 'municipality', item: municipality })}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {}
          {activeTab === 'addresses' && (
            <div className="card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-house me-2"></i>
                  Adrese
                </h5>
                <div>
                  <select 
                    className="form-select d-inline-block me-2" 
                    style={{width: 'auto'}}
                    onChange={(e) => e.target.value && openAddressModal(null, e.target.value)}
                    value=""
                  >
                    <option value="">Izaberite opštinu za dodavanje adrese</option>
                    {municipalities.map(municipality => (
                      <option key={municipality[0]} value={municipality[0]}>
                        {municipality[1]} ({getCityName(municipality[2])})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Ulica</th>
                        <th>Broj</th>
                        <th>Opština</th>
                        <th>Grad</th>
                        <th>Akcije</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addresses.map((address) => {
                        const municipality = municipalities.find(m => m[0] === address[3]);
                        const cityId = municipality ? municipality[2] : null;
                        
                        return (
                          <tr key={address[0]}>
                            <td>{address[1]}</td>
                            <td>{address[2]}</td>
                            <td>{getMunicipalityName(address[3])}</td>
                            <td>{cityId ? getCityName(cityId) : 'Nepoznat'}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-outline-primary me-1"
                                onClick={() => openAddressModal(address)}
                              >
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => setDeleteConfirm({ show: true, type: 'address', item: address })}
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {}
      {cityModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {cityModal.city ? 'Izmeni grad' : 'Dodaj grad'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setCityModal({ show: false, city: null })}
                ></button>
              </div>
              <form onSubmit={handleCitySubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Naziv grada *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={cityForm.naziv}
                      onChange={(e) => setCityForm({...cityForm, naziv: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Poštanski broj *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={cityForm.postanskiBroj}
                      onChange={(e) => setCityForm({...cityForm, postanskiBroj: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setCityModal({ show: false, city: null })}
                  >
                    Otkaži
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {cityModal.city ? 'Ažuriraj' : 'Kreiraj'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {}
      {municipalityModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {municipalityModal.municipality ? 'Izmeni opštinu' : 'Dodaj opštinu'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setMunicipalityModal({ show: false, municipality: null, selectedCityId: '' })}
                ></button>
              </div>
              <form onSubmit={handleMunicipalitySubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Naziv opštine *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={municipalityForm.naziv}
                      onChange={(e) => setMunicipalityForm({...municipalityForm, naziv: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Grad *</label>
                    <select
                      className="form-select"
                      value={municipalityForm.gradID}
                      onChange={(e) => setMunicipalityForm({...municipalityForm, gradID: e.target.value})}
                      required
                    >
                      <option value="">Izaberite grad</option>
                      {cities.map(city => (
                        <option key={city[0]} value={city[0]}>{city[1]}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setMunicipalityModal({ show: false, municipality: null, selectedCityId: '' })}
                  >
                    Otkaži
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {municipalityModal.municipality ? 'Ažuriraj' : 'Kreiraj'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {}
      {addressModal.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {addressModal.address ? 'Izmeni adresu' : 'Dodaj adresu'}
                </h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setAddressModal({ show: false, address: null, selectedMunicipalityId: '' })}
                ></button>
              </div>
              <form onSubmit={handleAddressSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Naziv ulice *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addressForm.nazivUlice}
                      onChange={(e) => setAddressForm({...addressForm, nazivUlice: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Broj *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={addressForm.broj}
                      onChange={(e) => setAddressForm({...addressForm, broj: e.target.value})}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Opština *</label>
                    <select
                      className="form-select"
                      value={addressForm.opstinaID}
                      onChange={(e) => setAddressForm({...addressForm, opstinaID: e.target.value})}
                      required
                    >
                      <option value="">Izaberite opštinu</option>
                      {municipalities.map(municipality => (
                        <option key={municipality[0]} value={municipality[0]}>
                          {municipality[1]} ({getCityName(municipality[2])})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => setAddressModal({ show: false, address: null, selectedMunicipalityId: '' })}
                  >
                    Otkaži
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {addressModal.address ? 'Ažuriraj' : 'Kreiraj'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {}
      {deleteConfirm.show && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Potvrdi brisanje</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setDeleteConfirm({ show: false, type: '', item: null })}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Da li ste sigurni da želite da obrišete{' '}
                  {deleteConfirm.type === 'city' && 'grad'}
                  {deleteConfirm.type === 'municipality' && 'opštinu'}
                  {deleteConfirm.type === 'address' && 'adresu'}{' '}
                  <strong>{deleteConfirm.item?.[1]}</strong>?
                </p>
                {deleteConfirm.type === 'city' && (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Brisanjem grada biće obrisane sve opštine i adrese u tom gradu!
                  </div>
                )}
                {deleteConfirm.type === 'municipality' && (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Brisanjem opštine biće obrisane sve adrese u toj opštini!
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setDeleteConfirm({ show: false, type: '', item: null })}
                >
                  Otkaži
                </button>
                <button 
                  type="button" 
                  className="btn btn-danger"
                  onClick={() => {
                    if (deleteConfirm.type === 'city') {
                      handleCityDelete(deleteConfirm.item[0]);
                    } else if (deleteConfirm.type === 'municipality') {
                      handleMunicipalityDelete(deleteConfirm.item[0]);
                    } else if (deleteConfirm.type === 'address') {
                      handleAddressDelete(deleteConfirm.item[0]);
                    }
                  }}
                >
                  Obriši
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddressManagement;
