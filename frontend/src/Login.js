import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setLoggedIn, setUsername, setBalance  }) => {
  const [username, setLocalUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const login = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', { username, password }, { withCredentials: true });
      setLoggedIn(true);
      setUsername(username);
      setBalance(response.data.balance);
      navigate('/dashboard');
      // window.location.href = '/dashboard';
    } catch (error) {
      console.log('esfa')
      alert('Invalid credentials');
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setLocalUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button onClick={login}>Login</button>
      <p>Don't have an account? <Link to="/signup">Sign up</Link></p>
      <p>Dashboard <Link to="/dashboard">Dashboard</Link></p>
    </div>
  );
};

export default Login;