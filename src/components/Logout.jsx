import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/useAuthStore';
import { LuLogOut } from "react-icons/lu";

function Logout() {
  const navigate = useNavigate();

  const handleLogout = () => {

    useAuthStore.setState({ isAuthenticated: false });
    navigate('/');
    localStorage.removeItem('user');
    localStorage.removeItem('username');
  };

  return (
    <>
      <div className='btn-ctrl'>
        <button onClick={handleLogout} className="back-btn">
          <LuLogOut />
        </button>
      <p>Logout</p>
      </div>
    </>
  );
}

export default Logout;