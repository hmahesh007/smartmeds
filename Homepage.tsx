import React from 'react';
import { useNavigate } from 'react-router-dom';

// No props needed if we're handling navigation inside Homepage
function Homepage() {
  let navigate = useNavigate();

  // Function to handle login click
  const handleLoginClick = () => {
    navigate('/login');
  };

  // Function to handle sign-up click
  const handleSignUpClick = () => {
    navigate('/signup');
  };

  return (
    <div>
      <h2>Welcome</h2>
      {/* Your logo here */}
      <div>
        <button onClick={handleLoginClick}>Login</button>
        <button onClick={handleSignUpClick}>Sign Up</button>
      </div>
    </div>
  );
}

export default Homepage;