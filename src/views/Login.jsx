import React from 'react';
import LoginForm from '../components/LoginForm';
import SignUp from '../components/SignUp';

function Login() {
  return (
    <>
      <div className="login">
        <h1>Optiplanner</h1>
        <LoginForm />
        <SignUp />
      </div>
    </>
  );
}

export default Login;