import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { FaTrashCan } from "react-icons/fa6";

const DeleteProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const user = localStorage.getItem('user');

  const handleDeleteProject = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this project?");
    if (!confirmDelete) {
      return;
    }

    try {
      const projectDoc = doc(db, 'projects', projectId);
      await deleteDoc(projectDoc);
      navigate(-1); // Navigate back to the previous page
    } catch (error) {
      console.error('Error deleting project: ', error);
    }
  };

  return (
    <button onClick={handleDeleteProject} style={{ color: 'red' }}>
      Delete Project <FaTrashCan />
    </button>
  );
};

export default DeleteProject;