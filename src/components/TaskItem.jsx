import React, { useState, useEffect } from 'react';
import TaskForm from './TaskForm';
import TaskModal from './TaskModal';
import { BsPencil, BsTrash3 } from "react-icons/bs";
import '../styles/global.css'; // Import the styles

const TaskItem = ({ task, handleCheckboxChange, handleDeleteTask, fetchTasks, categories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Store task data in sessionStorage
    sessionStorage.setItem(task.id, JSON.stringify({
      label: task.name,
      description: task.description,
      earliestCompletion: task.earliestCompletion,
      latestCompletion: task.latestCompletion,
    }));
  }, [task]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  const handleTaskClick = () => {
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const formatDescription = (description) => {
    return description.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        <br />
      </React.Fragment>
    ));
  };

  return (
    <>
      {isEditing ? (
        <TaskForm
          fetchTasks={fetchTasks}
          categories={categories}
          taskToEdit={task}
          setTaskToEdit={handleCancelEdit}
        />
      ) : (
        <div className="task">
          <div onClick={handleTaskClick} >
            <h4>{task.name}</h4>
            <p className='task-description'>{formatDescription(task.description)}</p>
            <p>EST: {task.earliestCompletion}</p>
            <p>LFT: {task.latestCompletion}</p>
          </div>

          <div className="task-controls">
            <div className='custom-checkbox'>
              <input
                type="checkbox"
                id={`checkbox-${task.id}`}
                checked={task.done === "true"}
                onChange={() => handleCheckboxChange(task.id, task.done)}
              />
              <label htmlFor={`checkbox-${task.id}`}></label>
            </div>

            <button 
              className="edit-button"
              onClick={handleEditClick}
            >
              <BsPencil />
            </button>

            <button 
              className="del-task-btn"
              onClick={() => handleDeleteTask(task.id)}
            >
              <BsTrash3 />
            </button>
          </div>
        </div>
      )}
      <TaskModal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        task={task}
        formattedDescription={formatDescription(task.description)}
        refreshTasks={fetchTasks}
      />
    </>
  );
};

export default TaskItem;