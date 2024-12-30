import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { getAuth, signInWithEmailAndPassword, reauthenticateWithCredential, EmailAuthProvider, GoogleAuthProvider, reauthenticateWithPopup } from 'firebase/auth';
import { FaTrashCan } from "react-icons/fa6";


const DeleteProject = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState('');
  const auth = getAuth();

  const handleDeleteProject = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User is not authenticated');
      }

      // Fetch the project document to get the owner's email
      const projectDoc = await getDoc(doc(db, 'projects', projectId));
      if (!projectDoc.exists()) {
        throw new Error('Project does not exist');
      }
      const projectData = projectDoc.data();
      const ownerEmail = projectData.owner;

      console.log('Owner email:', ownerEmail);
      console.log('Password:', password);

      // Check if the user signed in with Google
      if (user.providerData.some(provider => provider.providerId === 'google.com')) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        // Re-authenticate the user using the owner's email and provided password
        const credential = EmailAuthProvider.credential(ownerEmail, password);
        await reauthenticateWithCredential(user, credential);
      }

      // Delete the project
      await deleteDoc(doc(db, 'projects', projectId));
      navigate('/'); // Navigate back to root
    } catch (error) {
      console.error('Error deleting project: ', error);
      setError('Failed to delete project. Please check your password and try again.');
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
    handleDeleteProject();
    closeModal();
  };

  return (
    <div style={{ position: 'fixed', bottom: '0', right: '0', margin: '1rem' }}>
      <button onClick={openModal} style={{ backgroundColor: "red", color: 'white' }}>
        Delete Project <FaTrashCan />
      </button>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Enter Password to Delete Project</h2>
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

export default DeleteProject;