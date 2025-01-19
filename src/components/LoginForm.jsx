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
  const [errMessage, setErrMessage] = useState('please sign up to log in.');

  const handleSubmit = (e) => {
    e.preventDefault();

    const auth = getAuth();
    signInWithEmailAndPassword(auth, login, password)
      .then((userCredential) => {
        // Signed in 

        const user = userCredential.user.email;
        useAuthStore.setState({ isAuthenticated: true });
        
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
        {error && <p style={{ color: 'red' }}>{errMessage}</p>}
        <div className='button-container'>
          <button type="submit">Login</button>
          <button type="button" onClick={handleGoogleSignIn}>Login <FcGoogle /></button>
        </div>
      </div>
    </form>
  );
};

export default LoginForm;