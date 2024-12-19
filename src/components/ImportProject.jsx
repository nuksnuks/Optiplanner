import React, { useState } from 'react';
import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';
import { FiUpload } from "react-icons/fi";

const ImportProject = () => {
  const { projectId } = useParams();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const jsonString = e.target.result;
        const importData = JSON.parse(jsonString);

        // Upload project data
        const projectData = importData.project;
        await setDoc(doc(db, 'projects', projectId), projectData);

        // Upload tasks data
        const tasksData = importData.tasks;
        const tasksCollection = collection(db, 'projects', projectId, 'tasks');
        const uploadPromises = tasksData.map(task => addDoc(tasksCollection, task));
        await Promise.all(uploadPromises);

        setMessage('Project imported successfully!');
      } catch (error) {
        console.error('Error importing project: ', error);
        setError('Error importing project. Please try again.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <input type="file" accept=".json" onChange={handleFileChange} />
      <button>
        Import Project <FiUpload />
      </button>
    </div>
  );
};

export default ImportProject;