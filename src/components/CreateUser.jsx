import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification, updateProfile } from 'firebase/auth';
import { FcGoogle } from "react-icons/fc";

import useAuthStore from '../stores/useAuthStore';

function CreateUser() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleEmailSignUp = (e) => {
    e.preventDefault();

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        const user = userCredential.user;
        console.log('User signed up:', user.email);

        // Update the user's profile with the username
        updateProfile(user, {
          displayName: username
        }).then(() => {
          console.log('Username set:', username);

          sendEmailVerification(user)
            .then(() => {
              setMessage('Verification email sent. Please check your inbox.');
              console.log('Verification email sent to:', user.email);
            })
            .catch((error) => {
              console.error('Error sending verification email:', error);
              setError('Error sending verification email. Please try again.');
            });

          localStorage.setItem('username', username);
          localStorage.setItem('user', user.email);
          useAuthStore.setState({ isAuthenticated: true });
          console.log('User Login state:', useAuthStore.getState().isAuthenticated);
          navigate('/overview');
        }).catch((error) => {
          console.error('Error setting username:', error);
          setError('Error setting username. Please try again.');
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setError(errorMessage);
        console.error('Error signing up:', errorCode, errorMessage);
      });
  };

  const handleGoogleSignUp = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        // Signed in 
        const user = result.user;
        console.log('User signed in with Google:', user.email);
        localStorage.setItem('username', user.displayName);
        localStorage.setItem('user', user.email);
        useAuthStore.setState({ isAuthenticated: true });
        console.log('User Login state:', useAuthStore.getState().isAuthenticated);
        navigate('/overview');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setError(errorMessage);
        console.error('Error signing in with Google:', errorCode, errorMessage);
      });
  };

  return (
    <>
      <form onSubmit={handleEmailSignUp}>
        <div className='input-field'>
          <h2>Signup</h2>
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
          {message && <p style={{ color: 'green' }}>{message}</p>}
          <div className='button-container'>
            <button type="submit">Sign Up</button>
            <button type="button" onClick={handleGoogleSignUp}>Sign Up with Google <FcGoogle /></button>
          </div>
        </div>
      </form>
    </>
  );
}

export default CreateUser;