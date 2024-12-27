import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './Login';
import Signup from './Signup';
import Dashboard from './Dashboard';

const App = () => {
  const [loggedIn, setLoggedIn] = useState(null);
  const [username, setUsername] = useState([]);
  const [balance, setBalance] = useState(0.0);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await axios.get('http://localhost:5000/is_logged_in', { withCredentials: true });
        if (response.data.logged_in) {
          setLoggedIn(true);
          setUsername(response.data.username);
          setBalance(response.data.balance);

        } else {
          setLoggedIn(false);
        }
      } catch (error) {
        console.error('Error checking login status:', error);
      }
    };
  
    checkLoginStatus();
  }, []);

  return (
    <Router>
      <div style={{ padding: '20px' }}>
        <h1>Banking Application</h1>
        <Routes>
          <Route
            path="/login"
            element={<Login setLoggedIn={setLoggedIn} setUsername={setUsername} setBalance={setBalance}/>}
          />
          <Route
            path="/signup"
            element={<Signup />}
          />
          <Route
            path="/dashboard"
            element={
               loggedIn ? (
                <Dashboard username={username} setLoggedIn={setLoggedIn} balance={balance} setBalance={setBalance} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path="*" element={<Navigate to={loggedIn ? "/dashboard" : "/login"} />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
