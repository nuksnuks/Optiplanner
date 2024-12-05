import React from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, arrayRemove } from 'firebase/firestore';
import { db } from '../firebase';

const LeaveProject = ({ projectId, user }) => {
  const navigate = useNavigate();

  const handleLeaveProject = async () => {
    const confirmLeave = window.confirm("Are you sure you want to leave this project?");
    if (!confirmLeave) {
      return;
    }

    try {
      const projectDoc = doc(db, 'projects', projectId);
      await updateDoc(projectDoc, {
        collaborators: arrayRemove(user)
      });
      navigate('/overview'); // Navigate back to the overview page
    } catch (error) {
      console.error('Error leaving project: ', error);
    }
  };

  return (
    <button onClick={handleLeaveProject} style={{ color: 'red' }}>
      Leave Project
    </button>
  );
};

export default LeaveProject;