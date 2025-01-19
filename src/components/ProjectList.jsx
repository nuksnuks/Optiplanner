import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const ProjectList = ({ user }) => {
  const [projects, setProjects] = useState([]);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('owner', '==', user));
        const querySnapshot = await getDocs(q);
        const projectsList = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const projectData = doc.data();
          const tasksRef = collection(db, 'projects', doc.id, 'tasks');
          const tasksSnapshot = await getDocs(tasksRef);
          const totalTasks = tasksSnapshot.size;
          const completedTasks = tasksSnapshot.docs.filter(taskDoc => taskDoc.data().done === "true").length;
          const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          return {
            id: doc.id,
            ...projectData,
            completionPercentage: completionPercentage.toFixed(2) // Format to 2 decimal places
          };
        }));
        setProjects(projectsList);
     
      } catch (error) {
        console.error('Error fetching projects: ', error);
      }
    };

    if (user) {
      fetchProjects();
    }
  }, [user]);

  return (
    <div className='project-list'>
      <h2>My projects</h2>
      <div className='projects'>
        {projects.map(project => (
          <Link to={`./${project.id}`} className='project-link' key={project.id}>
            <div key={project.id} className="project-container">
              <p>
                {project.completionPercentage}%
              </p>
              <p>
                {project.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProjectList;