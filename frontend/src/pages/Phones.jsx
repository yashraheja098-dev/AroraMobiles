import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api';

const Phones = () => {
  const [phones, setPhones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        const res = await api.get('/phones');
        setPhones(res.data.data);
      } catch (error) {
        console.error('Error fetching phones:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPhones();
  }, []);

  const filteredPhones = phones.filter(phone => 
    `${phone.brand} ${phone.modelName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-extrabold text-primary tracking-tight">All Smartphones</h1>
            <p className="mt-2 text-secondary">Browse our premium collection of pre-owned devices.</p>
          </div>
          <div className="mt-4 md:mt-0 w-full md:w-72">
            <input 
              type="text" 
              placeholder="Search by brand or model..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-accent bg-white"
            />
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 text-secondary text-lg">Loading devices...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredPhones.map((phone, idx) => (
              <motion.div 
                key={phone._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-background rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group flex flex-col"
              >
                <div className="aspect-w-4 aspect-h-3 bg-gray-50 flex items-center justify-center p-6 h-56 relative">
                  <div className="absolute top-4 right-4 z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold 
                      ${phone.status === 'Available' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {phone.status}
                    </span>
                  </div>
                  {phone.images && phone.images.length > 0 ? (
                    <img 
                      src={phone.images[0].url.startsWith('http://localhost:5000') 
                            ? phone.images[0].url.replace('http://localhost:5000', import.meta.env.VITE_API_URL.replace('/api', ''))
                            : phone.images[0].url.startsWith('/') 
                              ? `${import.meta.env.VITE_API_URL.replace('/api', '')}${phone.images[0].url}` 
                              : phone.images[0].url} 
                      alt={phone.brand} 
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 group-hover:scale-105 transition-transform duration-300">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-primary">{phone.brand} {phone.modelName}</h3>
                    <p className="text-sm text-secondary mt-1">{phone.ram} RAM • {phone.storage} Storage</p>
                    <p className="text-sm text-secondary mt-1">Condition: {phone.condition}</p>
                  </div>
                  <div className="mt-6 flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">₹{phone.price.toLocaleString('en-IN')}</span>
                    <Link 
                      to={`/phones/${phone._id}`} 
                      className="text-white bg-primary hover:bg-secondary px-4 py-2 rounded-lg font-medium transition-colors"
                    >
                      View
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
            
            {filteredPhones.length === 0 && (
              <div className="col-span-full text-center py-20 text-secondary text-lg">
                No phones found matching your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Phones;
