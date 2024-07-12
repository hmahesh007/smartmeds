import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://127.0.0.1:5000/sign_in', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          email: email,
          pass: password
        })
      });
  
      const data = await response.json();
  
      if (response.status == 200) {
        navigate('/user_meds');
      } else {
        const queryParams = new URLSearchParams(await response.text());
        const err_msg = queryParams.get('err_msg');
        if (err_msg === 'Bad login') {
          alert('Incorrect username or password.');
        } else {
          alert('An error occurred. Please try again.');
        }
      }
    } catch (error) {
      //console.error('An error occurred:', error);
      alert('An error occurred. Please try again.');
    }
  };
  

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;