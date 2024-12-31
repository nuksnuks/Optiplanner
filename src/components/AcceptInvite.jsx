import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, where, doc, updateDoc, arrayRemove, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { FaCheck } from "react-icons/fa";
import { IoMdCloseCircleOutline } from "react-icons/io";

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
      setMessage(`You have accepted the invite.`);
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
      setMessage(`You have declined the invite.`);
      setInvites(invites.filter(invite => invite.id !== projectId));
    } catch (error) {
      console.error('Error declining invite: ', error);
      setError('Error declining invite. Please try again.');
    }
  };

  return (
    <div>
      <h2>Pending Invites</h2>
      {message && <p style={{ color: 'green' }}>{message} </p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div>
        {invites.map(invite => (
          <div key={invite.id}>
            <p>You're invited to: {invite.title}</p>
            <p>from: {invite.owner}</p>
            <button onClick={() => handleAcceptInvite(invite.id)} className='accept-btn'>Accept <FaCheck /></button>
            <button onClick={() => handleDeclineInvite(invite.id)} className='decline-btn'>Decline <IoMdCloseCircleOutline /></button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AcceptInvite;