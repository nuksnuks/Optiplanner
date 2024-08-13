import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../firebase.js';

const db = getFirestore(app);

const CreateProject = () => {
  const [title, setTitle] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = localStorage.getItem('user');
    console.log('User:', user);
    try {
      await addDoc(collection(db, user), {
        title: title,
      });
      setTitle('');
      alert('Project created successfully!');
      window.location.reload();
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className='input-field'>
        <label htmlFor="title">Project Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <button type="submit">Create Project</button>
    </form>
  );
};

export default CreateProject;