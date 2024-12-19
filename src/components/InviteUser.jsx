import React, { useState, useEffect } from 'react';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase';
import { IoPersonAdd } from "react-icons/io5";

const InviteUser = ({ projectId, user }) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      const projectDoc = doc(db, 'projects', projectId);
      await updateDoc(projectDoc, {
        pending: arrayUnion(email)
      });
      setMessage(`User ${email} has been invited.`);
      setEmail('');
    } catch (error) {
      console.error('Error inviting user: ', error);
      setError('Error inviting user. Please try again.');
    }
  };

  useEffect(() => {
    if (message || error) {
      const timer = setTimeout(() => {
        setMessage(null);
        setError(null);
      }, 10000); // 10 seconds

      return () => clearTimeout(timer); // Cleanup the timer on component unmount
    }
  }, [message, error]);

  return (
    <div>
      <form onSubmit={handleInvite}>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter user's email"
          required
        />
        <button type="submit">Invite <IoPersonAdd /></button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default InviteUser;