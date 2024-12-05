import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import useAuthStore from './stores/useAuthStore'; // Adjust the path as necessary
import Login from './views/Login';
import Overview from './views/Overview'; // Adjust the path as necessary
import Project from './views/Project'; // Adjust the path as necessary

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<Login />} 
        />
        <Route 
          path="/overview" 
          element={isAuthenticated ? <Overview /> : <Navigate to="/login" />} 
        />
        <Route 
          path="*" 
          element={<Navigate to={isAuthenticated ? "/overview" : "/login"} />} 
        />
        <Route 
          path="/overview/:projectId" 
          element={<Project/>} 
        />
      </Routes>
    </Router>
  );
}

export default App;