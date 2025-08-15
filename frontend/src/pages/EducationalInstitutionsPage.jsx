import React from 'react';
import Navbar from '../components/Navbar';
import EducationalInstitutionManagement from '../components/EducationalInstitutionManagement';

const EducationalInstitutionsPage = () => {
  const token = localStorage.getItem('token');

  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4">
        <EducationalInstitutionManagement token={token} />
      </div>
    </div>
  );
};

export default EducationalInstitutionsPage;
