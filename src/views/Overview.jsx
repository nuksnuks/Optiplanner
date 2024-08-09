import React, { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import Logout from '../components/Logout';
import CreateProject from '../components/CreateProject';

const Overview = () => {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'projects'));
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
  }, []);

  return (
    <>
      <div>Welcome {localStorage.getItem("user")}</div>
      <Logout />
      <CreateProject />
      <div>
        <h2>Projects</h2>
        <ul>
          {projects.map(project => (
            <li key={project.id}>{project.title}</li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default Overview;