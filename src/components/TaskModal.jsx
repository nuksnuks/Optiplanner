import React from 'react';
import Modal from 'react-modal';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

Modal.setAppElement('#root'); // Make sure to set the app element for accessibility

const TaskModal = ({ isOpen, onRequestClose, task, refreshTasks }) => {
  if (!task) return null;

  const handleCheckboxChange = async () => {
    try {
      if (!task.projectId || !task.id) {
        throw new Error('Invalid task data');
      }
      const taskDoc = doc(db, 'projects', task.projectId, 'tasks', task.id);
      await updateDoc(taskDoc, { done: task.done === "true" ? "false" : "true" });
      task.done = task.done === "true" ? "false" : "true"; // Update the local state
      refreshTasks(); // Refresh the tasks to update the UI
    } catch (error) {
      console.error('Error updating task: ', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Task Details"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>{task.name}</h2>
      <p>
        <strong>Description:</strong> 
        <br/> 
        {task.description}
      </p>
      <p><strong>Category:</strong> {task.category}</p>
      <p><strong>Status:</strong> {task.done === "true" ? "Completed" : "Incomplete"}</p>
      <label>
        {task.done === "true" ? "Incomplete" : "Completed"}
        <input
          type="checkbox"
          checked={task.done === "true"}
          onChange={handleCheckboxChange}
        />
      </label>
      <button onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default TaskModal;