import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendEmailVerification } from 'firebase/auth';
import { FcGoogle } from "react-icons/fc";
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import useAuthStore from '../stores/useAuthStore';

function SignUp() {
  const navigate = useNavigate();
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


        sendEmailVerification(user)
          .then(() => {
            setMessage('Verification email sent. Please check your inbox.');
            
          })
          .catch((error) => {
            console.error('Error sending verification email:', error);
            setError('Error sending verification email. Please try again.');
          });

        localStorage.setItem('user', user.email);
        useAuthStore.setState({ isAuthenticated: true });
        
        navigate('/overview');
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        setError(errorMessage);
        console.error('Error signing up:', errorCode, errorMessage);
      });
  };

  const handleGoogleSignUp = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
     

      // Check if the user exists in the database
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (!userDoc.exists()) {
        // User does not exist, prompt to re-register
        await setDoc(doc(db, 'users', user.uid), {
          email: user.email,
          createdAt: new Date(),
        });

      }

      localStorage.setItem('user', user.email);
      useAuthStore.setState({ isAuthenticated: true });
      
      navigate('/overview');
    } catch (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      setError(errorMessage);
      console.error('Error signing in with Google:', errorCode, errorMessage);
    }
  };

  return (
    <>
      <form onSubmit={handleEmailSignUp}>
        <div className='input-field'>
          <h2>Signup</h2>
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
            <button type="button" onClick={handleGoogleSignUp}>Sign Up <FcGoogle /></button>
          </div>
        </div>
      </form>
    </>
  );
}

export default SignUp;