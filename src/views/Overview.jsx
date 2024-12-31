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

  useEffect(() => {
    setUsername(localStorage.getItem('username'));
    setUser(localStorage.getItem('user'));

  }, []);

  return (
    <>
      <div className="horizontal-menu">
        <h2>
          Welcome {username ? username : 'Guest'}
        </h2>
        <div>
          <Logout />
          <DeleteAccount />
        </div>
      </div>

      <div className='overview-container'>
        <ProjectForm />
        <div className='overview-title'>
        
        <div className='all-projects'>
        <ProjectList user={user} />
        <CollabList user={user} />
        </div>
        <AcceptInvite userEmail={user} />
        </div>
      </div>
    </>
  );
};

export default Overview;