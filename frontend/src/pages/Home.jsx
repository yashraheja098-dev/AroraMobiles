import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import api from '../api';

const Home = () => {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dates, setDates] = useState([]);
  const [activeDate, setActiveDate] = useState('');

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        const res = await api.get('/phones');
        const allPhones = res.data.data;
        
        // Filter out phones that don't have a dealDate
        const dealPhones = allPhones.filter(p => p.dealDate);
        setPhones(dealPhones);
        
        // Extract unique dates and sort them
        const uniqueDates = [...new Set(dealPhones.map(p => p.dealDate))].sort();
        setDates(uniqueDates);
        
        // Set the active date to the closest upcoming date or today
        if (uniqueDates.length > 0) {
          const today = new Date().toISOString().split('T')[0];
          const upcomingOrToday = uniqueDates.find(d => d >= today) || uniqueDates[uniqueDates.length - 1];
          setActiveDate(upcomingOrToday);
        }
      } catch (error) {
        console.error('Error fetching phones', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhones();
  }, []);

  const formatDateLabel = (dateStr) => {
    const dateObj = new Date(dateStr);
    return dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  const activePhones = phones.filter(p => p.dealDate === activeDate);

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="bg-background pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-5xl md:text-7xl font-extrabold text-primary tracking-tight mb-6"
          >
            Premium Second-Hand <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-600">
              Smartphones
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-4 max-w-2xl text-xl text-secondary mx-auto mb-10"
          >
            Discover certified pre-owned devices at unbeatable prices. 
            Book your dream phone today with just ₹500.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Link 
              to="/phones" 
              className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-accent hover:bg-blue-600 transition-colors"
            >
              Browse All Phones
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Daily Deals Section */}
      <section className="py-20 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-extrabold text-primary mb-4 tracking-tight">Browse Deals Date-wise</h2>
            <p className="text-xl text-secondary max-w-2xl mx-auto">
              Select a date below to see which luxury devices were offered on that specific day.
            </p>
          </div>

          {loading ? (
            <div className="text-center text-secondary py-20">Loading deals...</div>
          ) : dates.length === 0 ? (
            <div className="text-center text-secondary py-20 bg-background rounded-3xl shadow-sm border border-gray-100">
              No scheduled deals at the moment. Please check back later!
            </div>
          ) : (
            <>
              {/* Date Bar */}
              <div className="flex overflow-x-auto gap-4 pb-4 mb-8 snap-x hide-scrollbar justify-start md:justify-center">
                {dates.map((date) => (
                  <button
                    key={date}
                    onClick={() => setActiveDate(date)}
                    className={`snap-center shrink-0 px-8 py-4 rounded-2xl text-lg font-bold transition-all duration-200 
                      ${activeDate === date 
                        ? 'bg-primary text-white shadow-lg scale-105' 
                        : 'bg-background text-secondary border border-gray-200 hover:border-gray-300'
                      }`}
                  >
                    {formatDateLabel(date)}
                  </button>
                ))}
              </div>

              {/* Deals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {activePhones.length === 0 ? (
                  <div className="col-span-full text-center py-10 text-secondary">
                    No phones available for this date.
                  </div>
                ) : (
                  activePhones.map((phone, index) => (
                    <motion.div
                      key={phone._id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-background rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col transform hover:-translate-y-1"
                    >
                      <div className="aspect-w-4 aspect-h-3 bg-gray-50 flex items-center justify-center p-6 h-64 relative">
                        <div className="absolute top-4 right-4 z-10 flex gap-2">
                           <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 shadow-sm">
                            Deal
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold shadow-sm
                            ${phone.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {phone.status}
                          </span>
                        </div>
                        {phone.images && phone.images.length > 0 ? (
                          <img src={phone.images[0].url} alt={phone.brand} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-8 flex-grow flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-primary mb-1">{phone.brand} {phone.modelName}</h3>
                          <p className="text-secondary text-sm mb-4">{phone.ram} RAM • {phone.storage} Storage</p>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-2xl font-bold text-primary">₹{phone.price.toLocaleString('en-IN')}</span>
                          <Link 
                            to={`/phones/${phone._id}`}
                            className="px-6 py-2 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-secondary transition-colors"
                          >
                            View Details
                          </Link>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
