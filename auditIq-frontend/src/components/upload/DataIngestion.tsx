import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

// This component is deprecated — the auditor workflow uses SubmissionsPage instead.
// Redirecting to ingestion page automatically.
export const DataIngestion = () => {
  const navigate = useNavigate();
  useEffect(() => { navigate('/auditor/ingestion'); }, [navigate]);
  return null;
};
