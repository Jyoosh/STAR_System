// src/auth/RoleRoute.js
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';

export default function RoleRoute({ children, role }) {
  const { user } = useContext(AuthContext);

  if (!user || user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
