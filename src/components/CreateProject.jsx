import React, { useState } from 'react';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app } from '../firebase.js';

const db = getFirestore(app);

const CreateProject = () => {
  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState('');
  const [deadline, setDeadline] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = localStorage.getItem('user');
    console.log('User:', user);
    try {
      await addDoc(collection(db, user), {
        title: title,
        startDate: startDate,
        deadline: deadline,
      });
      setTitle('');
      alert('Project created successfully!');
      window.location.reload();
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='input-field'>
      <h2>Create New Project</h2>
      <label htmlFor="title">Project Title:</label>
      <input
        type="text"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <label htmlFor="startdate">Start Date:</label>
      <input
        type="date"
        id="startdate"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        required
      />
      <label htmlFor="deadline">Deadline:</label>
      <input
        type="date"
        id="deadline"
        value={deadline}
        onChange={(e) => setDeadline(e.target.value)}
        required
      />
      <button type="submit">Create Project</button>
    </form>
  );
};

export default CreateProject;