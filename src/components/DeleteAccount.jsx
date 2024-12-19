import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, deleteUser } from 'firebase/auth';
import { collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FiUserX } from "react-icons/fi";

const DeleteAccount = () => {
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('user');

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account and all associated data?");
    if (!confirmDelete) {
      return;
    }

    try {
      // Delete all project data where the user is the owner
      const projectsCollection = collection(db, 'projects');
      const q = query(projectsCollection, where('owner', '==', userEmail));
      const projectsSnapshot = await getDocs(q);
      const deletePromises = projectsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user account
      const auth = getAuth();
      const user = auth.currentUser;
      await deleteUser(user);

      // Clear local storage and navigate to home
      localStorage.removeItem('user');
      setMessage('Account and all associated data have been deleted.');
      
      // Navigate to the root URL
      navigate('/login');

    } catch (error) {
      console.error('Error deleting account: ', error);
      setError('Error deleting account. Please try again.');
    }
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <button onClick={handleDeleteAccount}><FiUserX /></button>
    </div>
  );
};

export default DeleteAccount;