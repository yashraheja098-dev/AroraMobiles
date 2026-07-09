import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalPhones: 0, availablePhones: 0, soldPhones: 0, activeBookings: 0, totalRevenue: 0 });
  const [phones, setPhones] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form states for new phone
  const [newPhone, setNewPhone] = useState({ brand: '', modelName: '', storage: '', ram: '', condition: 'Excellent', price: '', dealDate: new Date().toISOString().split('T')[0], bookingLimit: 1 });
  const [images, setImages] = useState(null);
  const [selectedPhoneForOrders, setSelectedPhoneForOrders] = useState(null);
  const [filterDate, setFilterDate] = useState('All');

  const fetchData = async () => {
    try {
      const [statsRes, phonesRes, bookingsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/phones'),
        api.get('/admin/bookings')
      ]);
      setStats(statsRes.data.data);
      setPhones(phonesRes.data.data);
      setBookings(bookingsRes.data.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddPhone = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('brand', newPhone.brand);
    formData.append('modelName', newPhone.modelName);
    formData.append('storage', newPhone.storage);
    formData.append('ram', newPhone.ram);
    formData.append('condition', newPhone.condition);
    formData.append('price', newPhone.price);
    formData.append('dealDate', newPhone.dealDate);
    formData.append('bookingLimit', newPhone.bookingLimit);

    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i]);
      }
    }

    try {
      await api.post('/phones', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setNewPhone({ brand: '', modelName: '', storage: '', ram: '', condition: 'Excellent', price: '', dealDate: new Date().toISOString().split('T')[0], bookingLimit: 1 });
      setImages(null);
      document.getElementById('imageUpload').value = '';
      fetchData(); // refresh data
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding phone');
    }
  };

  const handleMarkSoldOffline = async (id) => {
    if (window.confirm("Are you sure this phone was sold offline? Any active bookings will be refunded.")) {
      try {
        await api.post(`/admin/sold-offline/${id}`);
        fetchData();
      } catch (error) {
        alert(error.response?.data?.message || 'Error marking as sold');
      }
    }
  };

  const handleResolveBooking = async (id, action) => {
    try {
      await api.post(`/admin/resolve-booking/${id}`, { action });
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error resolving booking');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;

  const uniqueDealDates = [...new Set(phones.map(p => p.dealDate).filter(Boolean))].sort();
  const displayedPhones = filterDate === 'All' ? phones : phones.filter(p => p.dealDate === filterDate);

  return (
    <div className="min-h-[calc(100vh-64px)] bg-surface py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-primary">Admin Dashboard</h1>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-background p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-secondary text-sm font-medium">Total Phones</p>
            <p className="text-2xl font-bold text-primary mt-2">{stats.totalPhones}</p>
          </div>
          <div className="bg-background p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-secondary text-sm font-medium">Available</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{stats.availablePhones}</p>
          </div>
          <div className="bg-background p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-secondary text-sm font-medium">Sold</p>
            <p className="text-2xl font-bold text-purple-600 mt-2">{stats.soldPhones}</p>
          </div>
          <div className="bg-background p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-secondary text-sm font-medium">Active Bookings</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{stats.activeBookings}</p>
          </div>
          <div className="bg-background p-6 rounded-2xl shadow-sm border border-gray-100">
            <p className="text-secondary text-sm font-medium">Total Revenue</p>
            <p className="text-2xl font-bold text-primary mt-2">₹{stats.totalRevenue}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Phones */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-background rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <h2 className="text-lg font-bold text-primary">Inventory Management</h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-secondary">Filter by Date:</label>
                  <select 
                    value={filterDate} 
                    onChange={(e) => setFilterDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:ring-accent focus:border-accent"
                  >
                    <option value="All">All Dates</option>
                    {uniqueDealDates.map(date => (
                      <option key={date} value={date}>{date}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {displayedPhones.map(phone => {
                      const phoneBookings = bookings.filter(b => b.phone?._id === phone._id);
                      return (
                      <tr key={phone._id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{phone.brand} {phone.modelName}</div>
                          <div className="text-sm text-gray-500">{phone.ram} | {phone.storage}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{phone.price}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${phone.status === 'Available' ? 'bg-green-100 text-green-800' : phone.status === 'Booked' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'}`}>
                            {phone.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                           <button 
                              onClick={() => setSelectedPhoneForOrders(phone)}
                              className="text-accent hover:text-blue-800 font-medium underline"
                            >
                              View Orders ({phoneBookings.length})
                           </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          {phone.status !== 'Sold' && (
                            <button 
                              onClick={() => handleMarkSoldOffline(phone._id)}
                              className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-1 rounded-md"
                            >
                              Mark Sold Offline
                            </button>
                          )}
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column: Add Phone Form */}
          <div className="space-y-6">
            <div className="bg-background p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-primary mb-4">Add New Phone</h2>
              <form onSubmit={handleAddPhone} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Brand</label>
                  <input type="text" required value={newPhone.brand} onChange={e => setNewPhone({...newPhone, brand: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Model Name</label>
                  <input type="text" required value={newPhone.modelName} onChange={e => setNewPhone({...newPhone, modelName: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">RAM</label>
                    <input type="text" required placeholder="e.g. 6GB" value={newPhone.ram} onChange={e => setNewPhone({...newPhone, ram: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Storage</label>
                    <input type="text" required placeholder="e.g. 128GB" value={newPhone.storage} onChange={e => setNewPhone({...newPhone, storage: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Price (₹)</label>
                  <input type="number" required value={newPhone.price} onChange={e => setNewPhone({...newPhone, price: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Condition</label>
                  <select value={newPhone.condition} onChange={e => setNewPhone({...newPhone, condition: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Deal Date (Optional)</label>
                    <input type="date" value={newPhone.dealDate} onChange={e => setNewPhone({...newPhone, dealDate: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-primary mb-1">Booking Limit (Stock)</label>
                    <input type="number" min="1" value={newPhone.bookingLimit} onChange={e => setNewPhone({...newPhone, bookingLimit: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-primary mb-1">Photos (Up to 5)</label>
                  <input id="imageUpload" type="file" multiple accept="image/*" onChange={e => setImages(e.target.files)} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <button type="submit" className="w-full py-2 bg-primary text-white rounded-md hover:bg-secondary transition-colors">
                  Add Device
                </button>
              </form>
            </div>
          </div>
          
        </div>
      </div>

      {/* Orders Modal */}
      {selectedPhoneForOrders && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-background rounded-2xl shadow-xl w-full max-w-4xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <h3 className="text-2xl font-bold text-primary">
                Orders for {selectedPhoneForOrders.brand} {selectedPhoneForOrders.modelName}
              </h3>
              <button 
                onClick={() => setSelectedPhoneForOrders(null)}
                className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
              >
                &times;
              </button>
            </div>
            
            <div className="overflow-y-auto flex-grow">
              {(() => {
                const phoneBookings = bookings.filter(b => b.phone?._id === selectedPhoneForOrders._id);
                if (phoneBookings.length === 0) {
                  return <div className="text-center py-10 text-secondary">No bookings found for this device.</div>;
                }
                return (
                  <table className="min-w-full divide-y divide-gray-200 border">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer Details</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {phoneBookings.map(booking => (
                        <tr key={booking._id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-gray-900">{booking.user?.name}</div>
                            <div className="text-sm text-gray-500">{booking.user?.email}</div>
                            <div className="text-sm text-accent font-medium mt-1">📞 {booking.user?.mobileNumber || 'N/A'}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${booking.status === 'Active' ? 'bg-blue-100 text-blue-800' : booking.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            {booking.status === 'Active' && (
                              <>
                                <button 
                                  onClick={() => handleResolveBooking(booking._id, 'complete')}
                                  className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-2 rounded font-semibold"
                                >
                                  Complete Sale
                                </button>
                                <button 
                                  onClick={() => handleResolveBooking(booking._id, 'cancel')}
                                  className="text-red-600 hover:text-red-900 bg-red-50 px-3 py-2 rounded font-semibold"
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
