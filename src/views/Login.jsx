import React from 'react';
import LoginForm from '../components/LoginForm';
import CreateUser from '../components/CreateUser';

function Login() {
  return (
    <>
      <h1>Optiplanner</h1>
      <LoginForm />
      <CreateUser />
    </>
  );
}

export default Login;