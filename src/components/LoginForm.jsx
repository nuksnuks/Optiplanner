import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import useAuthStore from '../stores/useAuthStore';
import { FcGoogle } from "react-icons/fc";

const LoginForm = () => {
  const navigate = useNavigate();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    const auth = getAuth();
    signInWithEmailAndPassword(auth, login, password)
      .then((userCredential) => {
        // Signed in 
        console.log('User signed in:', userCredential.user.email);
        const user = userCredential.user.email;
        useAuthStore.setState({ isAuthenticated: true });
        console.log('User Login state:', useAuthStore.getState().isAuthenticated);
        navigate('/overview');
        localStorage.setItem('user', user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setError(errorMessage);
        console.error('Error signing in:', errorCode, errorMessage);
      });
  };

  const handleGoogleSignIn = () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    signInWithPopup(auth, provider)
      .then((result) => {
        const user = result.user;
        useAuthStore.setState({ isAuthenticated: true });
        console.log('User Login state:', useAuthStore.getState().isAuthenticated);
        localStorage.setItem('username', user.displayName);
        localStorage.setItem('user', user.email);
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
    <form onSubmit={handleSubmit}>
      <div className='input-field'>
        <h2>Login</h2>
        <label>
          E-mail
        </label>
        <input
          type="text"
          value={login}
          onChange={(e) => setLogin(e.target.value)}
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
          <button type="submit">Login</button>
        </div>
        <button type="button" onClick={handleGoogleSignIn}>Login with Google <FcGoogle /></button>
      </div>
    </form>
  );
};

export default LoginForm;