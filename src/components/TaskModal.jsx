import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root'); // Make sure to set the app element for accessibility

const TaskModal = ({ isOpen, onRequestClose, task }) => {
  if (!task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Task Details"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>{task.name}</h2>
      <p><strong>Description:</strong> {task.description}</p>
      <p><strong>Category:</strong> {task.category}</p>
      <p><strong>Created At:</strong> {task.createdAt}</p>
      <p><strong>Status:</strong> {task.done === "true" ? "Completed" : "Incomplete"}</p>
      <button onClick={onRequestClose}>Close</button>
    </Modal>
  );
};

export default TaskModal;