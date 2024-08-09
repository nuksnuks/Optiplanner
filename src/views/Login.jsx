import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { app, analytics } from '../firebase';

import useAuthStore from '../stores/useAuthStore';
import CreateUser from '../components/CreateUser';

function Login() {
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
        const user = userCredential.user;
        useAuthStore.setState({ isAuthenticated: true });
        console.log('User Login state:', useAuthStore.getState().isAuthenticated);
        navigate('/overview');
        localStorage.setItem('user', login);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setError(errorMessage);
        console.error('Error signing in:', errorCode, errorMessage);
      });
  };

  return (
    <>
      <h1>Optiplanner</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>
            Login:
            <input
              type="text"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </label>
        </div>
        <div>
          <label>
            Password:
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </label>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit">Login</button>
      </form>
      <CreateUser />
    </>
  );
}

export default Login;