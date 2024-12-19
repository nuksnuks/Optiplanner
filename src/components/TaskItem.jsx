import React, { useState } from 'react';
import TaskForm from './TaskForm';
import TaskModal from './TaskModal';
import { BsPencil, BsTrash3 } from "react-icons/bs";

const TaskItem = ({ task, handleCheckboxChange, handleDeleteTask, fetchTasks, categories }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
          </div>

          <div className="task-controls">
            <input
              type="checkbox"
              className='edit-button'
              id="editButtons"
              checked={task.done === "true"}
              onChange={() => handleCheckboxChange(task.id, task.done)}
            />

            <button 
              className="edit-button"
              onClick={handleEditClick}
            >
              <BsPencil />
            </button>

            <button 
              className="edit-button"
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
        refreshTasks={fetchTasks} // Pass the fetchTasks function to refresh the tasks
      />
    </>
  );
};

export default TaskItem;