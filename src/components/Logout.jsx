import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    useAuthStore.setState({ isAuthenticated: false });
    console.log('User login state:', useAuthStore.getState().isAuthenticated);
    navigate('/login');
    localStorage.removeItem('user');
  };

  return (
    <button onClick={handleLogout}>
      Logout
    </button>
  );
}

export default Logout;