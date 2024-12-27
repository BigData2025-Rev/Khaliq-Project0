import React, { useState } from 'react';
import axios from 'axios';

const Dashboard = ({ username, balance, setLoggedIn, setBalance }) => {
  const [amount, setAmount] = useState('');
  const [history, setHistory] = useState([]);
 

  const logout = async () => {
    try {
      await axios.post('http://localhost:5000/logout', {}, { withCredentials: true });
      setLoggedIn(false);
    } catch (error) {
      alert('Error during logout');
    }
  };

  const deposit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/deposit', { amount: parseFloat(amount) }, { withCredentials: true });
      setBalance(response.data.balance);
    } catch (error) {
      alert('Error during deposit');
    }
  };

  const withdraw = async () => {
    try {
      const response = await axios.post('http://localhost:5000/withdraw', { amount: parseFloat(amount) }, { withCredentials: true });
      setBalance(response.data.balance);
    
    } catch (error) {
      alert('Error during withdrawal');
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await axios.get('http://localhost:5000/history', { withCredentials: true });
      setHistory(response.data.history);
    } catch (error) {
      alert('Error fetching history');
    }
  };

  return (
    <div>
      <h2>{username ? `Welcome, ${username}` : 'Loading...'}</h2>
      <h3>Balance: ${balance.toLocaleString()}</h3>
      <button onClick={logout}>Logout</button>
      <h3>Transaction</h3>
      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={deposit}>Deposit</button>
      <button onClick={withdraw}>Withdraw</button>
      <button onClick={fetchHistory}>Fetch History</button>

      <h3>Transaction History</h3>
      <ul>
        {history.map((item) => (
          <li key={item.id}>
            {item.type}: ${item.amount.toLocaleString()}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
