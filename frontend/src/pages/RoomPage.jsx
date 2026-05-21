import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import RoomForm from '../components/RoomForm';
import { useAuth, useLanguage } from '../hooks';
import { exportToCsv } from '../utils/csv';
import { RoomService } from '../services/studentService';
import './StudentPage.css';

export default function RoomPage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const commonCopy = t.common;
  const pageCopy = t.roomsPage;
  const canManage = user?.role === 'admin' || user?.role === 'teacher';

  const { roomId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [rooms, setRooms] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [showForm, setShowForm] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [editingRoom, setEditingRoom] = React.useState(null);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await RoomService.getRooms();
      setRooms(response.data);
    } catch (error) {
      console.error('Failed to fetch rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchRooms();
  }, []);

  React.useEffect(() => {
    const openCreate = location.pathname.endsWith('/create');
    if (openCreate) {
      setEditingRoom(null);
      setShowForm(true);
      return;
    }

    if (roomId) {
      (async () => {
        try {
          const response = await RoomService.getRoom(roomId);
          setEditingRoom(response.data);
          setShowForm(true);
        } catch (error) {
          console.error('Failed to load room:', error);
          navigate('/rooms', { replace: true });
        }
      })();
      return;
    }

    setShowForm(false);
    setEditingRoom(null);
  }, [roomId, location.pathname, navigate]);

  const filteredRooms = React.useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return rooms;
    return rooms.filter((room) => {
      const key = `${room.room_code || ''} ${room.building || ''} ${room.room_type || ''}`.toLowerCase();
      return key.includes(term);
    });
  }, [rooms, searchTerm]);

  const resetForm = () => {
    setShowForm(false);
    setEditingRoom(null);
    navigate('/rooms');
  };

  const handleSaveRoom = async (formData) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }

    setLoading(true);
    try {
      if (editingRoom) {
        await RoomService.updateRoom(editingRoom.id, formData);
      } else {
        await RoomService.createRoom(formData);
      }
      resetForm();
      await fetchRooms();
    } catch (error) {
      console.error('Failed to save room:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditRoom = (room) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    navigate(`/rooms/edit/${room.id}`);
  };

  const handleDeleteRoom = async (id) => {
    if (!canManage) {
      window.alert(commonCopy.roleRestricted);
      return;
    }
    if (window.confirm(pageCopy.confirmDelete)) {
      try {
        await RoomService.deleteRoom(id);
        await fetchRooms();
      } catch (error) {
        console.error('Failed to delete room:', error);
      }
    }
  };

  const handleExportCsv = () => {
    exportToCsv('rooms.csv', filteredRooms);
  };

  const renderRoomType = (value) => pageCopy.roomTypeLabels?.[value] ?? value;

  return (
    <div className="layout">
      <Navbar />
      <div className="main-container">
        <Sidebar activeMenu="rooms" />
        <main className="main-content">
          <section className="content-hero">
            <div>
              <h1>{pageCopy.title}</h1>
              <p>{pageCopy.description}</p>
            </div>
            <div className="content-hero-actions">
              <button type="button" className="btn-primary btn-secondary-tone" onClick={handleExportCsv}>
                {commonCopy.exportCsv}
              </button>
              {canManage && (
                <button type="button" className="btn-primary" onClick={() => navigate(showForm ? '/rooms' : '/rooms/create')}>
                  {showForm ? commonCopy.close : pageCopy.addRoom}
                </button>
              )}
            </div>
          </section>

          {showForm && (
            <div className="form-section">
              <div className="section-heading">
                <h2>{editingRoom ? pageCopy.editRoom : pageCopy.addRoom}</h2>
              </div>
              <RoomForm onSubmit={handleSaveRoom} initialData={editingRoom} isLoading={loading} />
              <div className="form-actions">
                <button type="button" className="btn-primary btn-secondary-tone" onClick={resetForm} disabled={loading}>
                  {commonCopy.close}
                </button>
              </div>
            </div>
          )}

          <div className="toolbar-card">
            <input
              type="text"
              placeholder={pageCopy.searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="students-table-section">
            {loading && !showForm ? (
              <p className="loading">{commonCopy.loading}</p>
            ) : filteredRooms.length === 0 ? (
              <p className="no-data">{commonCopy.noData}</p>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>{pageCopy.roomCode}</th>
                    <th>{pageCopy.building}</th>
                    <th>{pageCopy.floorNo}</th>
                    <th>{pageCopy.capacity}</th>
                    <th>{pageCopy.roomType}</th>
                    <th>{commonCopy.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRooms.map((room) => (
                    <tr key={room.id}>
                      <td>{room.room_code}</td>
                      <td>{room.building || '-'}</td>
                      <td>{room.floor_no ?? '-'}</td>
                      <td>{room.capacity ?? '-'}</td>
                      <td>{renderRoomType(room.room_type)}</td>
                      <td className="actions">
                        {canManage ? (
                          <>
                            <button type="button" className="btn-small btn-info" onClick={() => handleEditRoom(room)}>
                              {commonCopy.edit}
                            </button>
                            <button type="button" className="btn-small btn-danger" onClick={() => handleDeleteRoom(room.id)}>
                              {commonCopy.delete}
                            </button>
                          </>
                        ) : (
                          <span className="muted-text">{commonCopy.viewOnly}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

