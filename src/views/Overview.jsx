import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Logout from '../components/Logout';
import CreateProject from '../components/CreateProject';
import { Link } from 'react-router-dom';

const Overview = () => {
  const [projects, setProjects] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const user = localStorage.getItem('user');
    

    if (user) {
      setUser(user);
      const fetchProjects = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, user));
          const projectsList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setProjects(projectsList);
        } catch (error) {
          console.error('Error fetching projects: ', error);
        }
      };

      fetchProjects();
    } else {
      console.error('No user is currently logged in.');
    }
  }, []);

  return (
    <>
      <div>Welcome {user ? user : 'Guest'}</div>
      <Logout />
      <CreateProject />
      <div>
        <h2>Projects</h2>
        <ul>
          {projects.map(project => (
            <li key={project.id}>
              <Link to={`./${project.id}`}>{project.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Overview;