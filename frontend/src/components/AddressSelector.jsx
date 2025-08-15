import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AddressSelector = ({ value, onChange, token }) => {
  const [addresses, setAddresses] = useState([]);
  const [cities, setCities] = useState([]);
  const [municipalities, setMunicipalities] = useState([]);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);
  const [showCityModal, setShowCityModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  useEffect(() => {
    fetchAddresses();
    fetchCities();
    fetchMunicipalities();
  }, []);

  const fetchAddresses = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/addresses', axiosConfig);
      setAddresses(res.data);
    } catch (err) {
      console.error('Greška pri učitavanju adresa:', err);
    }
  };

  const fetchCities = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/cities', axiosConfig);
      setCities(res.data);
    } catch (err) {
      console.error('Greška pri učitavanju gradova:', err);
    }
  };

  const fetchMunicipalities = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/municipalities', axiosConfig);
      setMunicipalities(res.data);
    } catch (err) {
      console.error('Greška pri učitavanju opština:', err);
    }
  };

  const filteredAddresses = addresses.filter(address => 
    `${address[1]} ${address[2]}, ${address[4]}, ${address[5]}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddressCreated = () => {
    fetchAddresses();
    setShowAddressModal(false);
  };

  const handleMunicipalityCreated = () => {
    fetchMunicipalities();
    setShowMunicipalityModal(false);
  };

  const handleCityCreated = () => {
    fetchCities();
    setShowCityModal(false);
  };

  return (
    <div>
      <div className="">
        <div className="">
          <input
            type="text"
            className="form-control"
            placeholder="Pretraži adrese..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          
          {searchTerm && (
            <div className="dropdown-menu show w-100" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {filteredAddresses.map((address, index) => (
                <button
                  key={index}
                  className="dropdown-item"
                  onClick={() => {
                    onChange(address[0]);
                    setSearchTerm(`${address[1]} ${address[2]}, ${address[4]}, ${address[5]}`);
                  }}
                >
                  {address[1]} {address[2]}, {address[4]}, {address[5]}
                </button>
              ))}
              {filteredAddresses.length === 0 && (
                <div className="dropdown-item-text">Nema rezultata</div>
              )}
            </div>
          )}
        </div>
      </div>

      {}
      {false && showAddressModal && (
        <AddressModal
          show={showAddressModal}
          onHide={() => setShowAddressModal(false)}
          onSave={handleAddressCreated}
          cities={cities}
          municipalities={municipalities}
          token={token}
          onMunicipalityCreated={handleMunicipalityCreated}
          onCityCreated={handleCityCreated}
        />
      )}

      {}
      {showMunicipalityModal && (
        <MunicipalityModal
          show={showMunicipalityModal}
          onHide={() => setShowMunicipalityModal(false)}
          onSave={handleMunicipalityCreated}
          cities={cities}
          token={token}
          onCityCreated={handleCityCreated}
        />
      )}

      {}
      {showCityModal && (
        <CityModal
          show={showCityModal}
          onHide={() => setShowCityModal(false)}
          onSave={handleCityCreated}
          token={token}
        />
      )}
    </div>
  );
};

const AddressModal = ({ show, onHide, onSave, cities, municipalities, token, onMunicipalityCreated, onCityCreated }) => {
  const [formData, setFormData] = useState({
    ulica: '',
    broj: '',
    opstinaID: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMunicipalityModal, setShowMunicipalityModal] = useState(false);

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/api/addresses', formData, axiosConfig);
      alert('Adresa je uspešno kreirana!');
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-geo-alt me-2"></i>
              Dodaj novu adresu
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

              <div className="mb-3">
                <label className="form-label">Ulica *</label>
                <input
                  type="text"
                  className="form-control"
                  name="ulica"
                  value={formData.ulica}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Broj *</label>
                <input
                  type="text"
                  className="form-control"
                  name="broj"
                  value={formData.broj}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Opština *</label>
                <div className="d-flex">
                  <select
                    className="form-select me-2"
                    name="opstinaID"
                    value={formData.opstinaID}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Izaberi opštinu...</option>
                    {municipalities.map((municipality, index) => (
                      <option key={index} value={municipality[0]}>
                        {municipality[1]} ({municipality[3]})
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={() => setShowMunicipalityModal(true)}
                    title="Dodaj novu opštinu"
                  >
                    <i className="bi bi-plus-circle"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide} disabled={loading}>
                Otkaži
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Čuva se...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    Kreiraj adresu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {}
      {showMunicipalityModal && (
        <MunicipalityModal
          show={showMunicipalityModal}
          onHide={() => setShowMunicipalityModal(false)}
          onSave={() => {
            onMunicipalityCreated();
            setShowMunicipalityModal(false);
          }}
          cities={cities}
          token={token}
          onCityCreated={onCityCreated}
        />
      )}
    </div>
  );
};

const MunicipalityModal = ({ show, onHide, onSave, cities, token, onCityCreated }) => {
  const [formData, setFormData] = useState({
    naziv: '',
    gradID: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCityModal, setShowCityModal] = useState(false);

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/api/municipalities', formData, axiosConfig);
      alert('Opština je uspešno kreirana!');
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1070 }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-pin-map me-2"></i>
              Dodaj novu opštinu
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

              <div className="mb-3">
                <label className="form-label">Naziv opštine *</label>
                <input
                  type="text"
                  className="form-control"
                  name="naziv"
                  value={formData.naziv}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Grad *</label>
                <div className="d-flex">
                  <select
                    className="form-select me-2"
                    name="gradID"
                    value={formData.gradID}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Izaberi grad...</option>
                    {cities.map((city, index) => (
                      <option key={index} value={city[0]}>
                        {city[1]}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="btn btn-outline-success"
                    onClick={() => setShowCityModal(true)}
                    title="Dodaj novi grad"
                  >
                    <i className="bi bi-plus-circle"></i>
                  </button>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide} disabled={loading}>
                Otkaži
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Čuva se...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    Kreiraj opštinu
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {}
      {showCityModal && (
        <CityModal
          show={showCityModal}
          onHide={() => setShowCityModal(false)}
          onSave={() => {
            onCityCreated();
            setShowCityModal(false);
          }}
          token={token}
        />
      )}
    </div>
  );
};

const CityModal = ({ show, onHide, onSave, token }) => {
  const [formData, setFormData] = useState({
    naziv: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const axiosConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await axios.post('http://localhost:3000/api/cities', formData, axiosConfig);
      alert('Grad je uspešno kreiran!');
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!show) return null;

  return (
    <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 1080 }}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">
              <i className="bi bi-map me-2"></i>
              Dodaj novi grad
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

              <div className="mb-3">
                <label className="form-label">Naziv grada *</label>
                <input
                  type="text"
                  className="form-control"
                  name="naziv"
                  value={formData.naziv}
                  onChange={handleChange}
                  placeholder="npr. Beograd, Novi Sad..."
                  required
                />
              </div>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onHide} disabled={loading}>
                Otkaži
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Čuva se...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-1"></i>
                    Kreiraj grad
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

export default AddressSelector;
