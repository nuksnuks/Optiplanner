import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';

const AcceptInvite = ({ userEmail }) => {
  const [invites, setInvites] = useState([]);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const projectsRef = collection(db, 'projects');
        const q = query(projectsRef, where('pending', 'array-contains', userEmail));
        const querySnapshot = await getDocs(q);
        const invitesList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInvites(invitesList);
      } catch (error) {
        console.error('Error fetching invites: ', error);
        setError('Error fetching invites. Please try again.');
      }
    };

    if (userEmail) {
      fetchInvites();
    }
  }, [userEmail]);

  const handleAcceptInvite = async (projectId) => {
    try {
      const projectDoc = doc(db, 'projects', projectId);
      await updateDoc(projectDoc, {
        pending: arrayRemove(userEmail),
        collaborators: arrayUnion(userEmail)
      });
      setMessage(`You have accepted the invite to project ${projectId}.`);
      setInvites(invites.filter(invite => invite.id !== projectId));
    } catch (error) {
      console.error('Error accepting invite: ', error);
      setError('Error accepting invite. Please try again.');
    }
  };

  const handleDeclineInvite = async (projectId) => {
    try {
      const projectDoc = doc(db, 'projects', projectId);
      await updateDoc(projectDoc, {
        pending: arrayRemove(userEmail)
      });
      setMessage(`You have declined the invite to project ${projectId}.`);
      setInvites(invites.filter(invite => invite.id !== projectId));
    } catch (error) {
      console.error('Error declining invite: ', error);
      setError('Error declining invite. Please try again.');
    }
  };

  return (
    <div>
      <h2>Pending Invites</h2>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {invites.map(invite => (
          <li key={invite.id}>
            <p>Project: {invite.title}</p>
            <button onClick={() => handleAcceptInvite(invite.id)}>Accept Invite</button>
            <button onClick={() => handleDeclineInvite(invite.id)}>Decline Invite</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AcceptInvite;