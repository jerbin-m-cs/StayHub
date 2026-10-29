import React, { useCallback, useEffect, useState } from 'react';
import api from './api';

const emptyForm = { roomId: '', roomType: '', pricePerNight: '' };

function Rooms({ user }) {
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState(emptyForm);
  const [editingRoomId, setEditingRoomId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchRooms = useCallback(async () => {
    setError('');
    try {
      const { data } = await api.get('/rooms');
      setRooms(data);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to load rooms.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const resetForm = () => {
    setFormData(emptyForm);
    setEditingRoomId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSaving(true);
    try {
      if (editingRoomId) {
        await api.put(`/rooms/${encodeURIComponent(editingRoomId)}`, {
          roomType: formData.roomType,
          pricePerNight: Number(formData.pricePerNight)
        });
        setMessage('Room updated.');
      } else {
        await api.post('/rooms', {
          ...formData,
          pricePerNight: Number(formData.pricePerNight)
        });
        setMessage('Room added.');
      }
      resetForm();
      await fetchRooms();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to save room.');
    } finally {
      setSaving(false);
    }
  };

  const startEditing = (room) => {
    setEditingRoomId(room.roomId);
    setFormData({
      roomId: room.roomId,
      roomType: room.roomType,
      pricePerNight: String(room.pricePerNight)
    });
    setError('');
    setMessage('');
  };

  const handleDelete = async (roomId) => {
    if (!window.confirm(`Delete room ${roomId}?`)) return;
    setError('');
    setMessage('');
    try {
      await api.delete(`/rooms/${encodeURIComponent(roomId)}`);
      setMessage('Room deleted.');
      await fetchRooms();
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to delete room.');
    }
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-end mb-4">
        <div>
          <p className="text-primary text-uppercase small fw-semibold mb-1">StayHub</p>
          <h1 className="h2 mb-0">{user.role === 'staff' ? 'Room management' : 'Our rooms'}</h1>
        </div>
        <span className="text-secondary mt-2">{rooms.length} {rooms.length === 1 ? 'room' : 'rooms'}</span>
      </div>

      {error && <div className="alert alert-danger" role="alert">{error}</div>}
      {message && <div className="alert alert-success" role="status">{message}</div>}

      {user.role === 'staff' && (
        <div className="card border-0 shadow-sm mb-4">
          <div className="card-body p-4">
            <h2 className="h5 mb-3">{editingRoomId ? `Edit room ${editingRoomId}` : 'Add a room'}</h2>
            <form className="row g-3 align-items-end" onSubmit={handleSubmit}>
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="roomId">Room ID</label>
                <input
                  id="roomId"
                  name="roomId"
                  className="form-control"
                  value={formData.roomId}
                  onChange={handleChange}
                  disabled={Boolean(editingRoomId)}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="roomType">Room type</label>
                <input
                  id="roomType"
                  name="roomType"
                  className="form-control"
                  value={formData.roomType}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label" htmlFor="pricePerNight">Price per night</label>
                <input
                  id="pricePerNight"
                  name="pricePerNight"
                  type="number"
                  min="0"
                  step="0.01"
                  className="form-control"
                  value={formData.pricePerNight}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-12 d-flex gap-2">
                <button className="btn btn-primary" type="submit" disabled={saving}>
                  {saving ? 'Saving...' : editingRoomId ? 'Save changes' : 'Add room'}
                </button>
                {editingRoomId && (
                  <button className="btn btn-outline-secondary" type="button" onClick={resetForm}>
                    Stop editing
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="card border-0 shadow-sm">
        <div className="card-body p-0">
          <div className="p-4 pb-2">
            <h2 className="h5 mb-0">Rooms</h2>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th scope="col">Room</th>
                  <th scope="col">Type</th>
                  <th scope="col">Price per night</th>
                  <th scope="col">Availability</th>
                  {user.role === 'staff' && <th scope="col">Actions</th>}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={user.role === 'staff' ? 5 : 4} className="text-center py-4">Loading rooms…</td></tr>
                ) : rooms.length === 0 ? (
                  <tr><td colSpan={user.role === 'staff' ? 5 : 4} className="text-center text-secondary py-4">No rooms found.</td></tr>
                ) : rooms.map((room) => (
                  <tr key={room._id}>
                    <td className="fw-semibold">{room.roomId}</td>
                    <td>{room.roomType}</td>
                    <td>{new Intl.NumberFormat(undefined, { style: 'currency', currency: 'INR' }).format(room.pricePerNight)}</td>
                    <td>
                      <span className={`badge ${room.availabilityStatus ? 'text-bg-success' : 'text-bg-danger'}`}>
                        {room.availabilityStatus ? 'Available' : 'Booked'}
                      </span>
                    </td>
                    {user.role === 'staff' && (
                      <td>
                        <div className="d-flex gap-2">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            type="button"
                            onClick={() => startEditing(room)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            type="button"
                            onClick={() => handleDelete(room.roomId)}
                          >
                            Delete
                          </button>
                        </div>
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

export default Rooms;
