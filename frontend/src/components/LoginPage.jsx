import React, { useState } from 'react';

// Reusable text input component, matching your existing style
const TextInput = ({ label, value, type, placeholder, onChange }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      required
    />
  </div>
);

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent the form from reloading the page
    setError(null); // Clear any previous errors

    // TODO: Add your login logic here (e.g., API call)
    console.log('Attempting login with:', { username, password });

    // Example validation
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }

    // Example of what an API call might look like:
    /*
    fetch('http://your-api-endpoint/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Invalid credentials');
      }
      return response.json();
    })
    .then(data => {
      console.log('Login successful:', data);
      // Handle successful login (e.g., save token, redirect)
    })
    .catch(err => {
      setError(err.message || 'Login failed. Please try again.');
    });
    */
  };

  return (
    // This outer div centers the login form on the page
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      
      {/* The form container, styled just like your ScenarioControls component */}
      <div className="bg-white p-8 rounded-xl shadow-sm w-full max-w-md">
        
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Login
        </h2>
        
        <form onSubmit={handleSubmit}>
          <TextInput
            label="Username"
            type="text"
            value={username}
            onChange={setUsername}
            placeholder="Enter your username"
          />
          
          <TextInput
            label="Password"
            type="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter your password"
          />

          {/* Display login errors */}
          {error && (
            <div className="mb-4 text-sm text-red-600">
              {error}
            </div>
          )}

          {/* Login button, styled just like your Submit button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;