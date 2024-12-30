import React, { useState, useEffect } from 'react';
import Logout from '../components/Logout';
import ProjectForm from '../components/ProjectForm';
import DeleteAccount from '../components/DeleteAccount';
import ProjectList from '../components/ProjectList';
import CollabList from '../components/ProjectCollabList';
import AcceptInvite from '../components/AcceptInvite';

const Overview = () => {
  const [username, setUsername] = useState(null);
  const [user, setUser] = useState(null);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    setUser(localStorage.getItem('user'));

  }, []);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
  };

  return (
    <>
      <div onClick={toggleMenu} style={{ cursor: 'pointer' }}>
        <h2>
          Welcome {username ? username : 'Guest'}
        </h2>
      </div>
      {menuVisible && (
        <div className="horizontal-menu">
          <Logout />
          <DeleteAccount />
        </div>
      )}
      <div className='overview-container'>
        <ProjectForm />
        <div className='overview-title'>
        <ProjectList user={user} />
        <AcceptInvite userEmail={user} />
        <CollabList user={user} />
        </div>
      </div>
    </>
  );
};

export default Overview;