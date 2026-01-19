import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [state, setState] = useState('Sign Up');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (state === 'Sign Up') {
      // Signup Logic
      const { data, error } = await signUp({ email, password, options: { data: { name } } });

      if (error) {
        toast.error(`Signup Failed: ${error.message}`);
      } else {
        toast.success("Signup successful! Please check your email for verification.");
        setState('Login');
      }

    } else {
      // Login Logic
      const { data, error } = await signIn({ email, password });

      if (error) {
        toast.error(`Login Failed: ${error.message}`);
      } else {
        toast.success("Login Successful");

        // Admin Redirect Logic
        if (email === 'admin@prescripto.com') {
          navigate('/admin-dashboard');
        } else {
          navigate('/');
        }
      }
    }
  };

  return (
    <>
      <Navbar />
      <div className="w-full h-screen flex items-center justify-center bg-blue-50">
        <div className="w-[350px] bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-2xl font-semibold text-blue-900">
            {state === 'Sign Up' ? 'Create Account' : 'Login'}
          </h2>

          <p className="text-sm text-blue-600 mt-1 mb-5">
            Please {state === 'Sign Up' ? 'sign up' : 'login'} to book appointment
          </p>

          {state === 'Sign Up' && (
            <input
              type="text"
              placeholder="Enter Your Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-3 text-sm"
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-3 text-sm"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-blue-200 bg-blue-50 focus:bg-white focus:border-blue-600 outline-none mb-4 text-sm"
          />

          <button
            onClick={onSubmitHandler}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm mb-4"
          >
            {state === 'Sign Up' ? 'Sign Up' : 'Login'}
          </button>

          <p className="text-blue-700 text-sm">
            {state === 'Sign Up' ? (
              <span
                onClick={() => setState('Login')}
                className="cursor-pointer font-semibold hover:underline"
              >
                Already have an account? Login
              </span>
            ) : (
              <span
                onClick={() => setState('Sign Up')}
                className="cursor-pointer font-semibold hover:underline"
              >
                Create an account
              </span>
            )}
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;
