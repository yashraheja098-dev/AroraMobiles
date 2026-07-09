import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const PhoneDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [phone, setPhone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const res = await api.get(`/phones/${id}`);
        setPhone(res.data.data);
      } catch (err) {
        setError('Phone not found');
      } finally {
        setLoading(false);
      }
    };
    fetchPhone();
  }, [id]);

  const handleBooking = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setBookingLoading(true);
    setError('');

    try {
      // Create booking and Razorpay order
      const res = await api.post('/bookings', { phoneId: phone._id });
      const { order, data: booking } = res.data;

      // Mock Checkout Handle
      if (order.isMock) {
        await api.post('/bookings/verify', {
          razorpay_order_id: order.id,
          razorpay_payment_id: `mock_pay_${Date.now()}`,
          razorpay_signature: 'mock_signature',
          isMock: true
        });
        setShowModal(false);
        navigate('/dashboard');
        return;
      }

      // Initialize Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'test_key_id',
        amount: order.amount,
        currency: order.currency,
        name: 'Arora Mobiles',
        description: `Booking Fee for ${phone.brand} ${phone.modelName}`,
        order_id: order.id,
        handler: async function (response) {
          try {
            await api.post('/bookings/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            setShowModal(false);
            navigate('/dashboard'); // Go to dashboard on success
          } catch (err) {
            setError(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#2997ff',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        setError('Payment failed. Please try again.');
      });
      rzp.open();

    } catch (err) {
      setError(err.response?.data?.message || 'Could not initiate booking');
      setShowModal(false);
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-secondary">Loading...</div>;
  if (error && !phone) return <div className="text-center py-20 text-danger">{error}</div>;

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto bg-background rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 p-6 md:p-10 flex flex-col items-center">
            <div className="w-full bg-gray-50 p-4 flex items-center justify-center min-h-[400px] rounded-xl border border-gray-100">
              {phone.images && phone.images.length > 0 ? (
                <img 
                  src={phone.images[currentImage].url} 
                  alt={phone.brand} 
                  className="max-h-[400px] object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 min-h-[400px]">
                   No Image Available
                </div>
              )}
            </div>
            
            {/* Thumbnails */}
            {phone.images && phone.images.length > 1 && (
              <div className="flex gap-4 mt-6 overflow-x-auto w-full pb-2">
                {phone.images.map((img, idx) => (
                  <button 
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 ${currentImage === idx ? 'border-accent' : 'border-transparent opacity-60 hover:opacity-100'} transition-all`}
                  >
                    <img src={img.url} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Details Section */}
          <div className="md:w-1/2 p-10 flex flex-col justify-center">
            <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-4 w-fit
                      ${phone.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {phone.status}
            </span>
            <h1 className="text-4xl font-extrabold text-primary tracking-tight mb-2">
              {phone.brand} {phone.modelName}
            </h1>
            <p className="text-3xl font-bold text-accent mb-6">₹{phone.price.toLocaleString('en-IN')}</p>
            
            <div className="space-y-4 mb-8 border-y border-gray-100 py-6">
              <div className="flex justify-between">
                <span className="text-secondary font-medium">RAM</span>
                <span className="text-primary font-bold">{phone.ram}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary font-medium">Storage</span>
                <span className="text-primary font-bold">{phone.storage}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-secondary font-medium">Condition</span>
                <span className="text-primary font-bold">{phone.condition}</span>
              </div>
            </div>

            <p className="text-secondary mb-8 leading-relaxed">
              {phone.description || 'A premium quality pre-owned device, fully tested and certified by our experts at Arora Mobiles SGNR.'}
            </p>

            {error && <div className="mb-4 text-danger text-sm">{error}</div>}

            <button 
              onClick={() => setShowModal(true)}
              disabled={phone.status !== 'Available'}
              className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white bg-primary hover:bg-secondary disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {phone.status === 'Available' ? 'Book Now for ₹500' : 'Currently Unavailable'}
            </button>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-background rounded-2xl shadow-xl max-w-md w-full p-8"
            >
              <h3 className="text-2xl font-bold text-primary mb-4">Confirm Booking</h3>
              <p className="text-secondary mb-6 leading-relaxed">
                You are about to book the <strong>{phone.brand} {phone.modelName}</strong>. 
                A non-refundable booking fee of <strong>₹500</strong> is required to reserve this device.
                The remaining amount must be paid at the store.
              </p>
              
              <div className="flex space-x-4">
                <button 
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-primary bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="flex-1 py-3 px-4 rounded-xl font-medium text-white bg-accent hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex justify-center items-center"
                >
                  {bookingLoading ? 'Processing...' : 'Pay ₹500'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhoneDetails;
