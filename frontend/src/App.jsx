import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Phones from './pages/Phones'
import Deals from './pages/Deals'
import PhoneDetails from './pages/PhoneDetails'
import UserDashboard from './pages/UserDashboard'
import AdminDashboard from './pages/AdminDashboard'

const NotFound = () => <div className="p-8 text-xl text-danger">404 - Not Found</div>

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-surface flex flex-col">
        <Navbar />

        <main className="flex-grow w-full">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/phones" element={<Phones />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/phones/:id" element={<PhoneDetails />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <footer className="bg-secondary text-background p-4 text-center">
          <p>&copy; {new Date().getFullYear()} Arora Mobiles SGNR. All rights reserved.</p>
        </footer>
      </div>
    </Router>
  )
}

export default App
