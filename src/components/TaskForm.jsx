import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';

const TaskForm = ({ fetchTasks, categories, taskToEdit, setTaskToEdit, setCategoryOrder }) => {
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskCategory, setTaskCategory] = useState('');
  const { projectId } = useParams();

  useEffect(() => {
    if (taskToEdit) {
      setTaskName(taskToEdit.name);
      setTaskDescription(taskToEdit.description);
      setTaskCategory(taskToEdit.category);
    }
  }, [taskToEdit]);

  const handleDescriptionChange = (e) => {
    setTaskDescription(e.target.value);
  };

  const handleDescriptionKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setTaskDescription((prev) => prev + '\n');
    }
    console.log('Key pressed:', JSON.stringify(taskDescription));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (taskToEdit) {
        // Update existing task
        const taskDoc = doc(db, 'projects', projectId, 'tasks', taskToEdit.id);
        await updateDoc(taskDoc, {
          name: taskName,
          description: taskDescription,
          category: taskCategory,
        });
        setTaskToEdit(null);
      } else {
        // Add new task
        await addDoc(collection(db, 'projects', projectId, 'tasks'), {
          name: taskName,
          description: taskDescription,
          category: taskCategory,
          createdAt: new Date(),
          done: "false",
        });

        // Add new category to categoryOrder if it doesn't exist
        if (!categories.includes(taskCategory)) {
          const newCategoryOrder = [...categories, taskCategory];
          setCategoryOrder(newCategoryOrder);

          // Save the new category order to Firestore
          const projectDoc = doc(db, 'projects', projectId);
          await updateDoc(projectDoc, { categoryOrder: newCategoryOrder });
        }
      }
      console.log('Task submitted');
      setTaskName('');
      setTaskDescription('');
      setTaskCategory('');
      fetchTasks(); // Fetch tasks again to update the list
    } catch (error) {
      console.error('Error adding/updating document: ', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='input-field'>
      <h3>{taskToEdit ? 'Edit task' : 'Add new task'}</h3>
      <label htmlFor="taskName">Task:</label>
      <input
        type="text"
        id="taskName"
        value={taskName}
        onChange={(e) => setTaskName(e.target.value)}
        required
      />
      <label htmlFor="taskDescription">Description:</label>
      <textarea
        type='text'
        id='taskDescription'
        value={taskDescription}
        onChange={handleDescriptionChange}
        onKeyDown={handleDescriptionKeyDown}
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
      <button type="submit">{taskToEdit ? 'Update task' : 'Add new task'}</button>
      {taskToEdit && <button type="button" onClick={() => setTaskToEdit(null)}>Cancel</button>}
    </form>
  );
};

export default TaskForm;