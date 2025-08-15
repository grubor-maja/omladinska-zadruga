import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'bi-speedometer2', path: '/dashboard' },
    { id: 'worker-requests', label: 'Zahtevi za radnicima', icon: 'bi-briefcase', path: '/worker-requests' },
    { id: 'general-contracts', label: 'Generalni ugovori', icon: 'bi-file-earmark-text', path: '/general-contracts' },
    { id: 'members', label: 'Članovi zadruge', icon: 'bi-person-badge', path: '/members' },
    { id: 'companies', label: 'Kompanije', icon: 'bi-building', path: '/companies' },
    { id: 'address-management', label: 'Upravljanje adresama', icon: 'bi-geo-alt', path: '/address-management' },
    { id: 'educational-institutions', label: 'Obrazovne ustanove', icon: 'bi-mortarboard', path: '/educational-institutions' },
    { id: 'foreign-languages', label: 'Strani jezici', icon: 'bi-translate', path: '/foreign-languages' }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container-fluid">
        <button 
          className="navbar-brand btn btn-link text-light text-decoration-none"
          onClick={() => navigate('/dashboard')}
        >
          <i className="bi bi-building-gear me-2"></i>
          Omladinska Zadruga
        </button>
        
        <button 
          className="navbar-toggler" 
          type="button" 
          data-bs-toggle="collapse" 
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            {menuItems.map(item => (
              <li className="nav-item" key={item.id}>
                <button 
                  className={`nav-link btn btn-link text-decoration-none ${isActive(item.path) ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <i className={`${item.icon} me-1`}></i>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          
          <div className="navbar-nav">
            <button 
              className="btn btn-outline-light"
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-1"></i>
              Odjavi se
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
