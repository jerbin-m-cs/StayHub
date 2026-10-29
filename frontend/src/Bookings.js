import React, { useCallback, useEffect, useState } from 'react';
import api from './api';

const getLocalDate = (date = new Date()) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const dateAfter = (dateString) => {
  const date = dateString ? new Date(`${dateString}T00:00:00`) : new Date();
  date.setDate(date.getDate() + 1);
  return getLocalDate(date);
};

const emptyForm = {
  customerName: '',
  customerPhone: '',
  roomId: '',
  checkInDate: '',
  checkOutDate: ''
};

function Bookings({ user }) {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  const fetchData = useCallback(async () => {
    setError('');
    try {
      const [bookingResponse, roomResponse] = await Promise.all([
        api.get('/bookings'),
        api.get('/rooms')
      ]);
      setBookings(bookingResponse.data);
      setRooms(roomResponse.data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleBook = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      await api.post('/bookings', formData);
      setFormData(emptyForm);
      setMessage('Room booked successfully.');
      await fetchData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to book room.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!window.confirm('Cancel this booking?')) return;
    setError('');
    setMessage('');
    setCancellingId(bookingId);
    try {
      await api.put(`/bookings/cancel/${encodeURIComponent(bookingId)}`);
      setMessage('Booking cancelled.');
      await fetchData();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const availableRooms = rooms.filter((room) => room.availabilityStatus);

  return (
    <>
      <div className="mb-4">
        <p className="text-primary text-uppercase small fw-semibold mb-1">StayHub</p>
        <h1 className="h2 mb-0">{user.role === 'staff' ? 'Booking overview' : 'Your bookings'}</h1>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      {user.role === 'user' && (
        <section className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="h5 mb-3">Book a room</h2>
            <form className="row g-3" onSubmit={handleBook}>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="customerName">Customer name</label>
                <input
                  id="customerName"
                  name="customerName"
                  className="form-control"
                  value={formData.customerName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label" htmlFor="customerPhone">Phone number</label>
                <input
                  id="customerPhone"
                  name="customerPhone"
                  type="tel"
                  className="form-control"
                  value={formData.customerPhone}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="roomId">Available room</label>
                <select
                  id="roomId"
                  name="roomId"
                  className="form-select"
                  value={formData.roomId}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a room</option>
                  {availableRooms.map((room) => (
                    <option key={room._id} value={room.roomId}>
                      {room.roomId} - {room.roomType} ({new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(room.pricePerNight)} / night)
                    </option>
                  ))}
                </select>
                {availableRooms.length === 0 && <small className="text-secondary">No rooms are currently available.</small>}
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="checkInDate">Check-in</label>
                <input
                  id="checkInDate"
                  name="checkInDate"
                  type="date"
                  className="form-control"
                  min={getLocalDate()}
                  value={formData.checkInDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="checkOutDate">Check-out</label>
                <input
                  id="checkOutDate"
                  name="checkOutDate"
                  type="date"
                  className="form-control"
                  min={dateAfter(formData.checkInDate)}
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12">
                <button className="btn btn-success" type="submit" disabled={saving || availableRooms.length === 0}>
                  {saving ? 'Booking...' : 'Book room'}
                </button>
              </div>
            </form>
          </div>
        </section>
      )}

      <section className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="p-4 pb-2">
            <h2 className="h5 mb-0">{user.role === 'staff' ? 'All bookings' : 'Booking history'}</h2>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Customer</th>
                  <th scope="col">Room</th>
                  <th scope="col">Dates</th>
                  <th scope="col">Status</th>
                  {user.role === 'user' && <th scope="col">Action</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={user.role === 'user' ? 5 : 4} className="text-center py-4">Loading bookings…</td></tr>
                ) : bookings.length === 0 ? (
                  <tr><td colSpan={user.role === 'user' ? 5 : 4} className="text-center text-secondary py-4">No bookings found.</td></tr>
                ) : bookings.map((booking) => (
                  <tr key={booking._id}>
                    <td>
                      <div className="fw-semibold">{booking.customerName}</div>
                      <small className="text-secondary">{booking.customerPhone}</small>
                    </td>
                    <td>{booking.roomId}</td>
                    <td>
                      {new Date(booking.checkInDate).toLocaleDateString()} to {new Date(booking.checkOutDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={`badge ${booking.status === 'Booked' ? 'text-bg-primary' : 'text-bg-secondary'}`}>
                        {booking.status}
                      </span>
                    </td>
                    {user.role === 'user' && (
                      <td>
                        {booking.status === 'Booked' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            disabled={cancellingId === booking._id}
                            onClick={() => handleCancel(booking._id)}
                          >
                            {cancellingId === booking._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </>
  );
}

export default Bookings;
