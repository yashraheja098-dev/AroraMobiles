import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my');
        setBookings(res.data.data);
      } catch (error) {
        console.error('Error fetching bookings', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="bg-background rounded-2xl shadow-sm p-8 mb-8 border border-gray-100">
          <h1 className="text-3xl font-extrabold text-primary mb-2">Welcome, {user?.name}!</h1>
          <p className="text-secondary">Manage your active bookings and account details here.</p>
        </div>

        <h2 className="text-2xl font-bold text-primary mb-6">Your Bookings</h2>
        
        {loading ? (
          <div className="text-secondary">Loading your bookings...</div>
        ) : (
          <div className="space-y-6">
            {bookings.length === 0 ? (
              <div className="bg-background rounded-2xl shadow-sm p-8 text-center text-secondary border border-gray-100">
                You don't have any bookings yet.
              </div>
            ) : (
              bookings.map((booking) => (
                <div key={booking._id} className="bg-background rounded-2xl shadow-sm p-6 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex-grow">
                    <div className="flex items-center gap-4 mb-2">
                      <h3 className="text-xl font-bold text-primary">
                        {booking.phone?.brand} {booking.phone?.modelName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                        ${booking.status === 'Active' ? 'bg-blue-100 text-blue-800' : 
                          booking.status === 'Completed' ? 'bg-green-100 text-green-800' : 
                          booking.status === 'System_Refunded' ? 'bg-purple-100 text-purple-800' : 
                          'bg-red-100 text-red-800'}`}>
                        {booking.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-secondary text-sm">Booking ID: {booking._id}</p>
                    <p className="text-secondary text-sm mt-1">Paid: ₹{booking.bookingAmount} (Payment: {booking.paymentStatus})</p>
                  </div>
                  
                  {booking.status === 'System_Refunded' && (
                    <div className="bg-red-50 text-red-700 p-4 rounded-xl text-sm max-w-sm">
                      <strong>Note:</strong> This phone was sold offline before you could pick it up. Your booking fee has been fully refunded.
                    </div>
                  )}
                  {booking.status === 'Active' && (
                    <div className="bg-blue-50 text-blue-700 p-4 rounded-xl text-sm max-w-sm text-center">
                      Please visit our store within 24 hours to complete your purchase.
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
