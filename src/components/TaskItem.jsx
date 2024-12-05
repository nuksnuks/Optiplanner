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
        <>
          <div onClick={handleTaskClick} style={{ cursor: 'pointer' }}>
            <h4>{task.name}</h4>
            <p className='task-description'>{task.description}</p>
            <p>{task.createdAt}</p>
          </div>

          <div>
            <input
              type="checkbox"
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
        </>
      )}
      <TaskModal
        isOpen={isModalOpen}
        onRequestClose={handleModalClose}
        task={task}
      />
    </>
  );
};

export default TaskItem;