import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';

const TaskForm = ({ fetchTasks, categories }) => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const { projectId } = useParams();
  const userEmail = localStorage.getItem('user');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, userEmail, projectId, 'tasks'), {
        name: taskName,
        description: taskDescription,
        category: taskCategory,
        createdAt: new Date(),
        done: "false",
      });
      console.log('Task submitted');
      setTaskName('');
      setTaskDescription('');
      setTaskCategory('');
      fetchTasks(); // Fetch tasks again to update the list
    } catch (error) {
      console.error('Error adding document: ', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='input-field'>
        <h3>Add new task</h3>
      <label htmlFor="taskName">Task:</label>
      <input
        type="text"
        id="taskName"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        required
      />
      <label htmlFor="taskDescription">Description:</label>
      <input
        type='text'
        id='taskDescription'
        value={taskDescription}
        onChange={(e) => setTaskDescription(e.target.value)}
      />
      <label htmlFor="taskCategory">Category:</label>
      <input
        type='text'
        id='taskCategory'
        value={taskCategory}
        onChange={(e) => setTaskCategory(e.target.value)}
      />
      <label htmlFor="existingCategory">Select Existing Category:</label>
      <select
        id="existingCategory"
        onChange={(e) => setTaskCategory(e.target.value)}
        value={taskCategory}
      >
        <option value="">Select a category</option>
        {categories && categories.map((category, index) => (
          <option key={index} value={category}>{category}</option>
        ))}
      </select>
      <button type="submit">Add task</button>
    </form>
  );
};

export default TaskForm;