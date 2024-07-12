import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createRoot } from 'react-dom/client';


// Define the type for the state
interface SignUpState {
  name: string;
  password: string;
  email: string;
  phoneNumber: string;
}

function SignUp() {
  const [formData, setFormData] = useState<SignUpState>({
    name: '',
    password: '',
    email: '',
    phoneNumber: ''
  });

  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault();

  //   try {
  //     const response = await fetch('http://127.0.0.1:5000/signup', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/x-www-form-urlencoded',
  //       },
  //       body: new URLSearchParams({
  //         name: formData.name,
  //         password: formData.password,
  //         email: formData.email,
  //         phoneNumber: formData.phoneNumber
  //       }).toString()
  //     });
  
  //     if (response.ok) 
  //     {
  //       navigate('http://127.0.0.1:5000/user_meds');
  //     } 
  //     else 
  //     {
  //       const queryParams = new URLSearchParams(await response.text());
  //       const err_msg = queryParams.get('err_msg');
  //       if (err_msg === 'email used') {
  //         alert('Email is already in use.');
  //       } 
  //       else 
  //       {
  //         alert('An error occurred. Please try again1.');
  //       }
  //     }
  //   } catch (error) {
  //     console.error('An error occurred:', error);
  //     alert('An error occurred. Please try again2.');
  //   }
  // };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const response = await fetch('http://127.0.0.1:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          name: formData.name,
          password: formData.password,
          email: formData.email,
          phoneNumber: formData.phoneNumber
        }).toString()
      });
  
      if (response.ok) {
        navigate('/user_meds');
      } else {
        const responseData = await response.json();
        alert(responseData.error || 'An error occurred. Please try again1.');
      }
    } 
    catch (error) 
    {
      alert('An error occurred. Please try again2.');
    }
  };
  

  return (
    <div>
      <h2>Sign Up</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        <div>
          <label htmlFor="phoneNumber">Phone Number:</label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;
