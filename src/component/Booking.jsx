import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/bookings';

const statusOptions = ['pending', 'active', 'completed', 'cancelled', 'upcoming'];


const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = endDate - startDate;
    const diffDays = diffTime / (1000 * 60 * 60 * 24);
    return diffDays >= 1 ? Math.ceil(diffDays) : 0; 
};


const Booking = () => {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState({ type: '', text: '' }); 

    
    const fetchBookings = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token'); 
            const response = await axios.get(API_URL, {
                headers: { Authorization: `Bearer ${token}` },
                params: { limit: 20, page: 1 } 
            }); 
            
            setBookings(response.data.data || []);
            setLoading(false);
        } catch (err) {
            console.error("Admin: Failed to fetch bookings:", err);
            setError("Admin: Failed to load all booking data. Check authorization.");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);


    const handleStatusChange = async (bookingId, newStatus, currentDailyRate, pickupDate, returnDate) => {
        const originalBookings = [...bookings];
        setBookings(prevBookings => 
            prevBookings.map(b => 
                b._id === bookingId ? { ...b, status: newStatus } : b
            )
        );

        try {
            const token = localStorage.getItem('token');
            
            await axios.patch(`http://localhost:5000/api/bookings/${bookingId}/status`, { 
                status: newStatus 
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            console.log(`Booking ${bookingId} status updated to ${newStatus}`);
            setDeleteMessage({ type: 'success', text: `Status updated to ${newStatus}.` });

        } catch (err) {
            console.error(`Admin: Status update failed for ${bookingId}:`, err.response?.data?.message || err.message);
            setDeleteMessage({ type: 'error', text: `Status update failed: ${err.response?.data?.message || 'Try again.'}` });
            setBookings(originalBookings); 
        }
    };


    
    const handleDeleteBooking = async (bookingId, carMake) => {
      
        setDeleteMessage({ type: '', text: `Deleting booking for ${carMake}...` });
        
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setDeleteMessage({ type: 'error', text: 'Authorization token missing.' });
                return;
            }
            
            await axios.delete(`${API_URL}/${bookingId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            
            setBookings(prevBookings => prevBookings.filter(b => b._id !== bookingId));
            setDeleteMessage({ type: 'success', text: `Booking for ${carMake} successfully deleted.` });
        } catch (err) {
            console.error(`Admin: Deletion failed for ${bookingId}:`, err.response?.data?.message || err.message);
            setDeleteMessage({ type: 'error', text: `Deletion failed: ${err.response?.data?.message || 'Check server status.'}` });
        }
        

        setTimeout(() => setDeleteMessage({ type: '', text: '' }), 2000);
    };
    
    if (loading) return <div className="text-center mt-10"><p className="text-xl text-orange-500">Loading Admin Dashboard...</p></div>;
    if (error) return <div className="text-center mt-10"><p className="text-xl text-red-500">{error}</p></div>;

    return (
        <div className="p-4">
            <h2 className="text-4xl font-bold mb-3 text-center text-orange-500">Booking Dashboard (Admin)</h2>
            <p className="flex text-center justify-center text-gray-500 mb-6">Manage all fleet bookings and monitor vehicle status in real time</p>

            
            {deleteMessage.text && (
                <div className={`p-3 mb-4 rounded-lg text-center font-semibold max-w-lg mx-auto ${
                    deleteMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                    {deleteMessage.text}
                </div>
            )}

            <div className="max-w-7xl mx-auto">
                {bookings.length === 0 ? (
                    <div className="text-center py-10 border border-gray-200 rounded-lg"><p className="text-gray-500 text-lg">No bookings found in the system.</p></div>
                ) : (
                    <div className="overflow-x-auto shadow-lg rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Car Model</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bookings.map((booking) => {
                                    const days = calculateDays(booking.pickupDate, booking.returnDate);
                                    const displayAmount = booking.amount > 0 
                                        ? booking.amount 
                                        : (booking.car?.dailyRate * days || 0); 
                                        
                                    return (
                                        <tr key={booking._id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{booking.customer}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.car.make} {booking.car.model}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(booking.pickupDate).toLocaleDateString()} - {new Date(booking.returnDate).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                                                ₹ {displayAmount.toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <select
                                                    value={booking.status}
                                                    onChange={(e) => 
                                                        handleStatusChange(
                                                            booking._id, 
                                                            e.target.value, 
                                                            booking.car.dailyRate, 
                                                            booking.pickupDate, 
                                                            booking.returnDate
                                                        )
                                                    }
                                                    className={`px-2 py-1 text-xs leading-5 font-semibold rounded-md border 
                                                        ${booking.status === 'active' ? 'bg-green-100 text-green-800 border-green-300' : 
                                                         booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800 border-yellow-300' : 
                                                         'bg-gray-100 text-gray-800 border-gray-300'}
                                                    `}
                                                >
                                                    {statusOptions.map(status => (
                                                        <option key={status} value={status}>
                                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                                <button
                                                    onClick={() => handleDeleteBooking(booking._id, `${booking.car.make} ${booking.car.model}`)}
                                                    className="text-white bg-red-600 hover:bg-red-700 py-1 px-3 rounded-lg text-xs font-bold transition duration-150 shadow-md hover:shadow-lg"
                                                >
                                                    Delete
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}              </tbody>
                        </table>              </div>
                )}
            </div>
        </div>
    );
}

export default Booking;
