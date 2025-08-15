import React from 'react';
import Navbar from '../components/Navbar';
import ForeignLanguageManagement from '../components/ForeignLanguageManagement';

const ForeignLanguagesPage = () => {
  const token = localStorage.getItem('token');

  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4">
        <ForeignLanguageManagement token={token} />
      </div>
    </div>
  );
};

export default ForeignLanguagesPage;
