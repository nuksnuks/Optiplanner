import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { app, analytics } from '../firebase';

import useAuthStore from '../stores/useAuthStore';

function CreateUser() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleEmailSignUp = (e) => {
    e.preventDefault();

    const auth = getAuth();
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // Signed up 
        const user = userCredential.user;
        console.log('User signed up:', user.email);
        useAuthStore.setState({ isAuthenticated: true });
        console.log('User Login state:', useAuthStore.getState().isAuthenticated);
        navigate('/overview');
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
        localStorage.setItem('user', user.displayName);
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
        <h2>Create Account</h2>
          <label>
            Email:
          </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          <label>
            Password:
          </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <div className='button-container'>
          <button type="submit">Sign Up</button>
          <button onClick={handleGoogleSignUp}>Sign Up with Google</button>
        </div>
        </div>
      </form>
    </>
  );
}

export default CreateUser;