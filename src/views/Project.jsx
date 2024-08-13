import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

const Project = () => {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const user = localStorage.getItem('user');

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const docRef = doc(db, user, projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setProject(docSnap.data());
        } else {
          console.log('No such document!');
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [projectId]);

  if (!project) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{project.title}</h1>
      <p>{project.description}</p>
      {/* Add more project details here */}
    </div>
  );
};

export default Project;