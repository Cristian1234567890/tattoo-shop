import React, { useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';

/**
 * ClientProfilePage (Backward Compatibility Component)
 * Cleanly redirects requests from legacy /profile to the unified Client Dashboard
 * with the Configuration tab active (/client-dashboard?tab=configuracion).
 */
export const ClientProfilePage: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/client-dashboard?tab=configuracion', { replace: true });
  }, [navigate]);

  return <Navigate to="/client-dashboard?tab=configuracion" replace />;
};

export default ClientProfilePage;
