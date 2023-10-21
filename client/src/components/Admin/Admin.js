import React, { useState, useEffect } from 'react';
import Adminka from './Adminka';

const Admin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('loginToken');
    const expirationTime = localStorage.getItem('loginTokenExpiration');

    if (token && new Date().getTime() < Number(expirationTime)) {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = (event) => {
    event.preventDefault();

    const validUsername = process.env.REACT_APP_NAMEADMIN;
    const validPassword = process.env.REACT_APP_PASSWORDADMIN;

    if (username === validUsername && password === validPassword) {
      setLoggedIn(true);

      const token = 'admin';
      const expirationTime = new Date().getTime() + 2 * 60 * 60 * 1000;
      localStorage.setItem('loginToken', token);
      localStorage.setItem('loginTokenExpiration', expirationTime);
    } else {
      alert('Invalid username or password. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('loginToken');
    localStorage.removeItem('loginTokenExpiration');
    setLoggedIn(false);
  };

  if (loggedIn) {
    return (
      <div>
        <h1>Welcome to the App!</h1>
        <button 
            style={{color: "#fff", marginBottom: "30px"}} 
            onClick={handleLogout}>Logout</button>
        <Adminka />
      </div>
    );
  }

  return (
    <div className="login-form">
      <h1>Admin Login</h1>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className='input_admin'
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className='input_admin'
        />
        <button className='admin_button' type="submit">Login</button>
      </form>
    </div>
  );
};

export default Admin;