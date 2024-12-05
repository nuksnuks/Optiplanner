import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useParams } from 'react-router-dom';
import TaskItem from './TaskItem';
import TaskForm from './TaskForm';

const TaskList = ({ setCategories }) => {
  const [tasks, setTasks] = useState([]);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const { projectId } = useParams();
  const userEmail = localStorage.getItem('username');
  console.log(projectId)

  const fetchTasks = async () => {
    try {
      const projectDoc = doc(db, 'projects', projectId);
      const projectSnap = await getDoc(projectDoc);
      if (projectSnap.exists()) {
        const projectData = projectSnap.data();
        if (projectData || projectData.collaborators.includes(userEmail)) {
          const querySnapshot = await getDocs(collection(db, 'projects', projectId, 'tasks'));
          const tasksList = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt.toDate().toDateString() // Convert Timestamp to Date string
          }));
          setTasks(tasksList);

          // Extract unique categories from tasks
          const uniqueCategories = [...new Set(tasksList.map(task => task.category))];
          setCategories(uniqueCategories);
        } else {
          console.log('User is not a collaborator on this project.');
        }
      } else {
        console.log('No such document!');
      }
    } catch (error) {
      console.error('Error fetching tasks: ', error);
    }
  };

  useEffect(() => {
    fetchTasks();
    console.log('Fetching tasks...', userEmail);
  }, [projectId, userEmail]);

  const handleCheckboxChange = async (taskId, currentStatus) => {
    try {
      const taskDoc = doc(db, 'projects', projectId, 'tasks', taskId);
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

  const handleDeleteTask = async (taskId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) {
      return;
    }

    try {
      const taskDoc = doc(db, 'projects', projectId, 'tasks', taskId);
      await deleteDoc(taskDoc);
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
    } catch (error) {
      console.error('Error deleting task: ', error);
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

  const uniqueCategories = [...new Set(tasks.map(task => task.category))];

  return (
    <>
      <div className='task-board'>
        <TaskForm 
          fetchTasks={fetchTasks} 
          categories={uniqueCategories} 
          taskToEdit={taskToEdit} 
          setTaskToEdit={setTaskToEdit} 
        />
        <div className='tasks-container'>
          {['incomplete', 'completed'].map(status => (
            <div key={status} className='status-container'>
              <h2>{status === 'incomplete' ? 'To-Do' : 'Completed Tasks'}</h2>
              <div className='category-board'>
                {Object.keys(groupedTasks[status]).map(category => (
                  <div key={category} className='category-container'>
                    <h3>{category}</h3>
                    <ul className='task-container'>
                      {groupedTasks[status][category].map(task => (
                        <TaskItem
                          key={task.id}
                          task={task}
                          handleCheckboxChange={handleCheckboxChange}
                          handleDeleteTask={handleDeleteTask}
                          fetchTasks={fetchTasks}
                          categories={uniqueCategories}
                        />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TaskList;