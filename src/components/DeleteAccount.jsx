import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, deleteUser, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { collection, getDocs, deleteDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { FiUserX } from "react-icons/fi";

const DeleteAccount = () => {
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const userEmail = localStorage.getItem('user');

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account and all associated data?");
    if (!confirmDelete) {
      return;
    }

    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User is not authenticated');
      }

      // Re-authenticate the user
      if (user.providerData.some(provider => provider.providerId === 'google.com')) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Delete all project data where the user is the owner
      const projectsCollection = collection(db, 'projects');
      const q = query(projectsCollection, where('owner', '==', userEmail));
      const projectsSnapshot = await getDocs(q);
      const deletePromises = projectsSnapshot.docs.map(doc => deleteDoc(doc.ref));
      await Promise.all(deletePromises);

      // Delete user account
      await deleteUser(user);

      // Clear local storage and navigate to home
      localStorage.removeItem('user');
      localStorage.removeItem('username');
      localStorage.removeItem('auth-storage');
      setMessage('Account and all associated data have been deleted.');
      
      // Navigate to the root URL
      navigate('/login');

    } catch (error) {
      console.error('Error deleting account: ', error);
      setError('Error deleting account. Please try again.');
    }
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setError('');
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    handleDeleteAccount();
    closeModal();
  };

  return (
    <div>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <button onClick={openModal}><FiUserX /></button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enter Password to Delete Account</h2>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            <form onSubmit={handleModalSubmit}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={handlePasswordChange}
                required
              />
              <button type="submit" style={{ backgroundColor: "red", color: 'white' }}>
                Confirm Delete
              </button>
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeleteAccount;