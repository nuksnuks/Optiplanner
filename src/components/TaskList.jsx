import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';

const TaskList = ({ setCategories }) => {
  const [tasks, setTasks] = useState([]);
  const { projectId } = useParams();
  const userEmail = localStorage.getItem('user');

  const fetchTasks = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, userEmail, projectId, 'tasks'));
      const tasksList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate().toDateString() // Convert Timestamp to Date string
      }));
      setTasks(tasksList);

      // Extract unique categories from tasks
      const uniqueCategories = [...new Set(tasksList.map(task => task.category))];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [projectId, userEmail]);

  const handleCheckboxChange = async (taskId, currentStatus) => {
    try {
      const taskDoc = doc(db, userEmail, projectId, 'tasks', taskId);
      await updateDoc(taskDoc, { done: currentStatus === "true" ? "false" : "true" });
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === taskId ? { ...task, done: currentStatus === "true" ? "false" : "true" } : task
        )
      );
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  };

  // Group tasks by category and completion status
  const groupedTasks = tasks.reduce((acc, task) => {
    const key = task.done === "true" ? 'completed' : 'incomplete';
    if (!acc[key]) {
      acc[key] = {};
    }
    if (!acc[key][task.category]) {
      acc[key][task.category] = [];
    }
    acc[key][task.category].push(task);
    return acc;
  }, { completed: {}, incomplete: {} });

  return (
    <div className='task-board'>
      {['incomplete', 'completed'].map(status => (
        <div key={status} className='status-container'>
          <h2>{status === 'incomplete' ? 'To-Do' : 'Completed Tasks'}</h2>
          <div className='category-board'>
            {Object.keys(groupedTasks[status]).map(category => (
              <div key={category} className='category-container'>
                <h3>{category}</h3>
                <ul className='task-container'>
                  {groupedTasks[status][category].map(task => (
                    <li key={task.id}>
                      <h4>{task.name}</h4>
                      <p className='task-description'>{task.description}</p>
                      <p>{task.createdAt}</p>
                      <input
                        type="checkbox"
                        checked={task.done === "true"}
                        onChange={() => handleCheckboxChange(task.id, task.done)}
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;