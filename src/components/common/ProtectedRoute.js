import React from 'react';
import PropTypes from 'prop-types';
import { Navigate } from 'react-router-dom';

function ProtectedRoute({ children, role }) {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('token');

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (role && user.role !== role) {
    // Yanlış role sahip kullanıcıyı login'e yönlendir
    return <Navigate to="/login" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  role: PropTypes.string.isRequired
};

export default ProtectedRoute; 