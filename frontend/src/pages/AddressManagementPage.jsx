import React from 'react';
import Navbar from '../components/Navbar';
import AddressManagement from '../components/AddressManagement';

const AddressManagementPage = () => {
  const token = localStorage.getItem('token');

  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4">
        <AddressManagement token={token} />
      </div>
    </div>
  );
};

export default AddressManagementPage;
