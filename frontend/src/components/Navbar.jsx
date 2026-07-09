import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center">
            <motion.span 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-xl font-bold text-primary tracking-tight"
            >
              Arora Mobiles
            </motion.span>
          </Link>
          
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-secondary hover:text-accent transition-colors">Home</Link>
            <Link to="/phones" className="text-secondary hover:text-accent transition-colors">Phones</Link>
            <Link to="/deals" className="text-secondary hover:text-accent transition-colors">Deals</Link>
            
            {user ? (
              <>
                <Link to={user.role === 'admin' ? '/admin/dashboard' : '/dashboard'} className="text-secondary hover:text-accent transition-colors">
                  Dashboard
                </Link>
                <button onClick={handleLogout} className="text-danger hover:text-red-700 transition-colors">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="text-accent hover:text-blue-700 font-medium transition-colors">
                Login / Register
              </Link>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
