import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import WorkerRequests from './pages/WorkerRequests';
import Companies from './pages/Companies';
import GeneralContracts from './pages/GeneralContracts';
import Members from './pages/Members';
import AddressManagementPage from './pages/AddressManagementPage';
import EducationalInstitutionsPage from './pages/EducationalInstitutionsPage';
import ForeignLanguagesPage from './pages/ForeignLanguagesPage';
import ProtectedRoute from './components/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/worker-requests" element={
          <ProtectedRoute>
            <WorkerRequests />
          </ProtectedRoute>
        } />
        <Route path="/companies" element={
          <ProtectedRoute>
            <Companies />
          </ProtectedRoute>
        } />
        <Route path="/general-contracts" element={
          <ProtectedRoute>
            <GeneralContracts />
          </ProtectedRoute>
        } />
        <Route path="/members" element={
          <ProtectedRoute>
            <Members />
          </ProtectedRoute>
        } />
        <Route path="/address-management" element={
          <ProtectedRoute>
            <AddressManagementPage />
          </ProtectedRoute>
        } />
        <Route path="/educational-institutions" element={
          <ProtectedRoute>
            <EducationalInstitutionsPage />
          </ProtectedRoute>
        } />
        <Route path="/foreign-languages" element={
          <ProtectedRoute>
            <ForeignLanguagesPage />
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
};

export default App;
