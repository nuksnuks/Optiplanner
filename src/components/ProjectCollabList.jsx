import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Link } from 'react-router-dom';

const CollabList = ({ user }) => {
  const [Collabs, setCollabs] = useState([]);

  useEffect(() => {
    const fetchCollabProjects = async () => {
      try {
        const collabRef = collection(db, 'projects');
        const q = query(collabRef, where('collaborators', 'array-contains', user));
        const querySnapshot = await getDocs(q);
        const collabList = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const collabData = doc.data();
          const tasksRef = collection(db, 'projects', doc.id, 'tasks');
          const tasksSnapshot = await getDocs(tasksRef);
          const totalTasks = tasksSnapshot.size;
          const completedTasks = tasksSnapshot.docs.filter(taskDoc => taskDoc.data().done === "true").length;
          const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
          return {
            id: doc.id,
            ...collabData,
            completionPercentage: completionPercentage.toFixed(2)
          };
        }));
        setCollabs(collabList);
        console.log('collaborated projects: ', collabList);
      } catch (error) {
        console.error('Error fetching projects: ', error);
      }
    };

    if (user) {
      fetchCollabProjects();
    }
  }, [user]);

  return (
    <div className='project-list'>
      <h2>Collaboration projects</h2>
      <div div className='projects'>
        {Collabs.map(collab => (
          <Link to={`./${collab.id}`} className='project-link'>
            <div key={collab.id} className="project-container">
              <p>
                {collab.completionPercentage}%
              </p>
              <p>
              {collab.title} 
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default CollabList;