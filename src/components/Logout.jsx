import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { LuLogOut } from "react-icons/lu";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {

    useAuthStore.setState({ isAuthenticated: false });
    console.log('User login state:', useAuthStore.getState().isAuthenticated);
    navigate('/');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
  };

  return (
    <button onClick={handleLogout}>
      <LuLogOut />
    </button>
  );
}

export default Logout;