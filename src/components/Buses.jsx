import { useState, useEffect } from 'react';
import '../styles/Body.scss';
import '../styles/Requests.scss';
import TableSkeletonRows from './TableSkeletonRows';
import {
  getArchivedBusesData,
  getBusesData,
  saveArchivedBusesData,
  saveBusesData,
} from '../data/busesData';
// Uncomment when integrating with API:
// import { fetchBuses, createBus, updateBus, deleteBus } from '../services/api';

function Buses() {
  const [buses, setBuses] = useState([]); // Use empty array [] when API is ready
  const [archivedBuses, setArchivedBuses] = useState([]);
  const [selectedBusIds, setSelectedBusIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedBus, setSelectedBus] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('active');
  const [sortBy, setSortBy] = useState('lastUpdated');
  const [sortOrder, setSortOrder] = useState('desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newBus, setNewBus] = useState({
    busNumber: '',
    route: '',
    busCompany: '',
    status: 'Active',
    plateNumber: '',
    capacity: '',
    busAttendant: '',
    busCompanyEmail: '',
    busCompanyContact: '',
    registeredDestination: '',
    busPhoto: null
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setBuses(getBusesData());
      setArchivedBuses(getArchivedBusesData());
      setLoading(false);
    }, 700);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading) {
      saveBusesData(buses);
    }
  }, [buses, loading]);

  useEffect(() => {
    if (!loading) {
      saveArchivedBusesData(archivedBuses);
    }
  }, [archivedBuses, loading]);

  // API Integration - Uncomment when backend is ready
  /*
  useEffect(() => {
    loadBuses();
  }, [currentPage, searchQuery, sortBy, sortOrder]);

  const loadBuses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchBuses({
        page: currentPage,
        limit: itemsPerPage,
        search: searchQuery,
        sortBy: sortBy,
        sortOrder: sortOrder
      });
      setBuses(data.buses); // Adjust based on your API response structure
      // If your API returns totalCount, you can calculate totalPages:
      // setTotalPages(Math.ceil(data.totalCount / itemsPerPage));
    } catch (err) {
      setError(err.message || 'Failed to load buses');
      console.error('Error loading buses:', err);
    } finally {
      setLoading(false);
    }
  };
  */

  // Filter buses based on search query
  const sourceBuses = viewMode === 'active' ? buses : archivedBuses;

  const filteredBuses = sourceBuses.filter(bus => {
    const query = searchQuery.toLowerCase();
    return (
      bus.busNumber.toLowerCase().includes(query) ||
      bus.route.toLowerCase().includes(query) ||
      bus.busCompany.toLowerCase().includes(query) ||
      bus.plateNumber.toLowerCase().includes(query) ||
      bus.busAttendant.toLowerCase().includes(query) ||
      bus.status.toLowerCase().includes(query)
    );
  });

  // Sort buses
  const sortedBuses = [...filteredBuses].sort((a, b) => {
    let aValue, bValue;

    switch (sortBy) {
      case 'busNumber':
        aValue = a.busNumber;
        bValue = b.busNumber;
        break;
      case 'route':
        aValue = a.route;
        bValue = b.route;
        break;
      case 'busCompany':
        aValue = a.busCompany;
        bValue = b.busCompany;
        break;
      case 'status':
        aValue = a.status;
        bValue = b.status;
        break;
      case 'capacity':
        aValue = a.capacity;
        bValue = b.capacity;
        break;
      case 'lastUpdated':
      default:
        aValue = a.lastUpdated;
        bValue = b.lastUpdated;
        break;
    }

    if (sortBy === 'capacity' || sortBy === 'lastUpdated') {
      // Numeric comparison
      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    } else {
      // String comparison
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    }
  });

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedBuses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.max(1, Math.ceil(sortedBuses.length / itemsPerPage));

  // Change page
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Reset to first page when search or sort changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleViewModeChange = (nextMode) => {
    setViewMode(nextMode);
    setCurrentPage(1);
    setSelectedBusIds([]);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };

  const handleSortOrderToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  const archiveBusIds = (busIds) => {
    if (!Array.isArray(busIds) || busIds.length === 0) {
      return;
    }

    const idsToArchive = new Set(busIds);
    const busesToArchive = buses.filter((bus) => idsToArchive.has(bus.id));

    if (busesToArchive.length === 0) {
      return;
    }

    const archivedEntries = busesToArchive.map((bus) => ({
      ...bus,
      previousStatus: bus.status,
      status: 'Archived',
      archivedAt: Date.now(),
      lastUpdated: Date.now(),
    }));

    setArchivedBuses((previousArchivedBuses) => [...archivedEntries, ...previousArchivedBuses]);
    setBuses((previousBuses) => previousBuses.filter((bus) => !idsToArchive.has(bus.id)));
    setSelectedBusIds((previousSelectedBusIds) => previousSelectedBusIds.filter((id) => !idsToArchive.has(id)));

    if (selectedBus && idsToArchive.has(selectedBus.id)) {
      closeModal();
    }
  };

  const deleteArchivedBusIds = (busIds, options = { confirm: true }) => {
    if (!Array.isArray(busIds) || busIds.length === 0) {
      return;
    }

    const idsToDelete = new Set(busIds);

    if (options.confirm) {
      const shouldDelete = window.confirm(
        idsToDelete.size > 1
          ? `Delete ${idsToDelete.size} archived buses permanently? This action cannot be undone.`
          : 'Delete this archived bus permanently? This action cannot be undone.'
      );

      if (!shouldDelete) {
        return;
      }
    }

    setArchivedBuses((previousArchivedBuses) => previousArchivedBuses.filter((bus) => !idsToDelete.has(bus.id)));
    setSelectedBusIds((previousSelectedBusIds) => previousSelectedBusIds.filter((id) => !idsToDelete.has(id)));

    if (selectedBus && idsToDelete.has(selectedBus.id)) {
      closeModal();
    }
  };

  const unarchiveBusIds = (busIds) => {
    if (!Array.isArray(busIds) || busIds.length === 0) {
      return;
    }

    const idsToRestore = new Set(busIds);
    const busesToRestore = archivedBuses.filter((bus) => idsToRestore.has(bus.id));

    if (busesToRestore.length === 0) {
      return;
    }

    const restoredBuses = busesToRestore.map((bus) => {
      const { previousStatus, archivedAt, ...restBus } = bus;

      return {
        ...restBus,
        status: previousStatus || 'Inactive',
        lastUpdated: Date.now(),
      };
    });

    setBuses((previousBuses) => [...restoredBuses, ...previousBuses]);
    setArchivedBuses((previousArchivedBuses) => previousArchivedBuses.filter((bus) => !idsToRestore.has(bus.id)));
    setSelectedBusIds((previousSelectedBusIds) => previousSelectedBusIds.filter((id) => !idsToRestore.has(id)));

    if (selectedBus && idsToRestore.has(selectedBus.id)) {
      closeModal();
    }
  };

  const handleArchiveBus = (busId) => {
    archiveBusIds([busId]);
  };

  const handleBatchArchive = () => {
    archiveBusIds(selectedBusIds);
  };

  const handleDeleteArchivedBus = (busId) => {
    deleteArchivedBusIds([busId]);
  };

  const handleUnarchiveBus = (busId) => {
    unarchiveBusIds([busId]);
  };

  const handleBatchDeleteArchived = () => {
    deleteArchivedBusIds(selectedBusIds);
  };

  const handleBatchUnarchive = () => {
    unarchiveBusIds(selectedBusIds);
  };

  const currentPageBusIds = currentItems.map((bus) => bus.id);
  const hasCurrentItems = currentPageBusIds.length > 0;
  const isAllCurrentPageSelected = hasCurrentItems && currentPageBusIds.every((id) => selectedBusIds.includes(id));

  const handleToggleSelectBus = (busId) => {
    setSelectedBusIds((previousSelectedBusIds) => (
      previousSelectedBusIds.includes(busId)
        ? previousSelectedBusIds.filter((id) => id !== busId)
        : [...previousSelectedBusIds, busId]
    ));
  };

  const handleToggleSelectAllCurrent = () => {
    if (!hasCurrentItems) {
      return;
    }

    setSelectedBusIds((previousSelectedBusIds) => {
      if (isAllCurrentPageSelected) {
        return previousSelectedBusIds.filter((id) => !currentPageBusIds.includes(id));
      }

      const selectedSet = new Set(previousSelectedBusIds);
      currentPageBusIds.forEach((id) => selectedSet.add(id));
      return Array.from(selectedSet);
    });
  };

  // Handle row click
  const handleRowClick = (bus) => {
    setSelectedBus(bus);
    setShowModal(true);
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedBus(null);
  };

  // Open add bus modal
  const openAddModal = () => {
    setShowAddModal(true);
  };

  // Close add bus modal
  const closeAddModal = () => {
    setShowAddModal(false);
    setNewBus({
      busNumber: '',
      route: '',
      busCompany: '',
      status: 'Active',
      plateNumber: '',
      capacity: '',
      busAttendant: '',
      busCompanyEmail: '',
      busCompanyContact: '',
      registeredDestination: '',
      busPhoto: null
    });
  };

  // Handle input change in add bus form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewBus(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleBusPhotoUpload = (e) => {
    const file = e.target.files && e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = typeof reader.result === 'string' ? reader.result : null;

      setNewBus((prevBus) => ({
        ...prevBus,
        busPhoto: imageData,
      }));
    };
    reader.readAsDataURL(file);
  };

  const removeBusPhoto = () => {
    setNewBus((prevBus) => ({
      ...prevBus,
      busPhoto: null,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (!newBus.busNumber || !newBus.route || !newBus.busCompany ||
      !newBus.plateNumber || !newBus.capacity || !newBus.busAttendant ||
      !newBus.busCompanyEmail || !newBus.busCompanyContact ||
      !newBus.registeredDestination) {
      alert('Please fill in all required fields');
      return;
    }

    // API Integration - Uncomment when backend is ready
    /*
    try {
      setLoading(true);
      const newBusData = {
        ...newBus,
        capacity: parseInt(newBus.capacity)
      };
      const createdBus = await createBus(newBusData);
      setBuses(prev => [createdBus, ...prev]); // Add to beginning (latest first)
      closeAddModal();
      alert(`Bus ${newBus.busNumber} added successfully!`);
    } catch (err) {
      setError(err.message || 'Failed to add bus');
      alert('Failed to add bus. Please try again.');
      console.error('Error adding bus:', err);
    } finally {
      setLoading(false);
    }
    */

    // Local state update (current implementation)
    // Remove this block when API is integrated
    const newBusEntry = {
      ...newBus,
      id: buses.length > 0 ? Math.max(...buses.map(b => b.id)) + 1 : 1,
      capacity: parseInt(newBus.capacity),
      lastUpdated: Date.now()
    };
    setBuses(prev => [...prev, newBusEntry]);
    closeAddModal();

    // Show success message
    alert(`Bus ${newBus.busNumber} added successfully!`);
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'status-completed';
      case 'Maintenance': return 'status-in-progress';
      case 'Inactive': return 'status-pending';
      case 'Archived': return 'status-archived';
      default: return '';
    }
  };

  const isArchivedView = viewMode === 'archived';

  return (
    <main className="content">
      <div className="requests-container">
        <div className="requests-header">
          <div className="header-content">
            <div>
              <h1>Buses</h1>
              <p className="subtitle">Manage active buses, archive removals, and permanently delete archived entries</p>
            </div>
          </div>
        </div>

        {/* Search and Sort Controls */}
        <div className="search-sort-controls">
          <div className="search-sort-group">

            <div className="search-bar">
              <input
                type="text"
                placeholder={isArchivedView
                  ? 'Search archived buses by number, route, company, plate, attendant, or status...'
                  : 'Search by bus number, route, company, plate, attendant, or status...'}
                value={searchQuery}
                onChange={handleSearchChange}
                className="search-input"
              />
            </div>

            <div className="sort-controls">
              <label htmlFor="sortBy">Sort by:</label>
              <select
                id="sortBy"
                value={sortBy}
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="lastUpdated">Last Updated</option>
                <option value="busNumber">Bus Number</option>
                <option value="route">Route</option>
                <option value="busCompany">Company</option>
                <option value="status">Status</option>
                <option value="capacity">Capacity</option>
              </select>

              <button
                onClick={handleSortOrderToggle}
                className="sort-order-btn"
                title={`Currently sorting ${sortOrder === 'asc' ? 'ascending' : 'descending'}`}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          </div>
          <div className="bus-actions-toolbar">
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${!isArchivedView ? 'active' : ''}`}
                onClick={() => handleViewModeChange('active')}
              >
                Active ({buses.length})
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${isArchivedView ? 'active' : ''}`}
                onClick={() => handleViewModeChange('archived')}
              >
                Archived ({archivedBuses.length})
              </button>
            </div>

            {!isArchivedView && (
              <button className="add-bus-btn" onClick={openAddModal}>
                + Add New Bus
              </button>
            )}

            {selectedBusIds.length > 0 && (
              <div className="batch-actions-bar">
                <span>{selectedBusIds.length} selected</span>
                {isArchivedView ? (
                  <>
                    <button type="button" className="table-action-btn restore" onClick={handleBatchUnarchive}>
                      Unarchive Selected
                    </button>
                    <button type="button" className="table-action-btn delete" onClick={handleBatchDeleteArchived}>
                      Delete Permanently
                    </button>
                  </>
                ) : (
                  <button type="button" className="table-action-btn archive" onClick={handleBatchArchive}>
                    Archive Selected
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="error-message" style={{
            padding: '1rem',
            backgroundColor: '#f8d7da',
            color: '#721c24',
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div className="table-container">
          <table className="requests-table">
            <colgroup>
              <col style={{ width: '4%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '22%' }} />
              <col style={{ width: '18%' }} />
              <col style={{ width: '12%' }} />
              <col style={{ width: '14%' }} />
              <col style={{ width: '8%' }} />
              <col style={{ width: '14%' }} />
            </colgroup>
            <thead>
              <tr>
                <th className="center-col">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={isAllCurrentPageSelected}
                    onChange={handleToggleSelectAllCurrent}
                    disabled={!hasCurrentItems}
                  />
                </th>
                <th>Bus Number</th>
                <th>Route</th>
                <th>Bus Company</th>
                <th className="center-col">Status</th>
                <th>Plate Number</th>
                <th className="center-col">Capacity</th>
                <th className="center-col">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <TableSkeletonRows rows={6} columns={8} />
              ) : currentItems.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '2rem' }}>
                    {searchQuery
                      ? 'No buses found matching your search.'
                      : isArchivedView
                        ? 'No archived buses yet.'
                        : 'No active buses yet.'}
                  </td>
                </tr>
              ) : (
                currentItems.map((bus) => (
                  <tr key={bus.id} onClick={() => handleRowClick(bus)} className="clickable-row">
                    <td className="center-col" onClick={(event) => event.stopPropagation()}>
                      <input
                        type="checkbox"
                        className="table-checkbox"
                        checked={selectedBusIds.includes(bus.id)}
                        onChange={() => handleToggleSelectBus(bus.id)}
                      />
                    </td>
                    <td className="bus-number">{bus.busNumber}</td>
                    <td>{bus.route}</td>
                    <td>{bus.busCompany}</td>
                    <td className="center-col">
                      <span className={`status-badge ${getStatusClass(bus.status)}`}>
                        {bus.status}
                      </span>
                    </td>
                    <td>{bus.plateNumber}</td>
                    <td className="center-col">{bus.capacity}</td>
                    <td className="center-col action-cell">
                      {isArchivedView ? (
                        <>
                          <button
                            type="button"
                            className="table-action-btn restore"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleUnarchiveBus(bus.id);
                            }}
                          >
                            Unarchive
                          </button>
                          <button
                            type="button"
                            className="table-action-btn delete"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteArchivedBus(bus.id);
                            }}
                          >
                            Delete Permanently
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          className="table-action-btn archive"
                          onClick={(event) => {
                            event.stopPropagation();
                            handleArchiveBus(bus.id);
                          }}
                        >
                          Archive
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {sortedBuses.length > 0 && (
          <div className="pagination">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="pagination-btn"
            >
              Previous
            </button>

            <div className="page-numbers">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => paginate(number)}
                  className={`page-number ${currentPage === number ? 'active' : ''}`}
                >
                  {number}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="pagination-btn"
            >
              Next
            </button>
          </div>
        )}

        {sortedBuses.length > 0 && (
          <div className="table-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, sortedBuses.length)} of {sortedBuses.length} {isArchivedView ? 'archived' : 'active'} buses
            {searchQuery && ` (filtered from ${sourceBuses.length} total)`}
          </div>
        )}
      </div>

      {/* Add Bus Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content add-bus-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Bus</h2>
              <button className="close-btn" onClick={closeAddModal}>&times;</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div className="form-grid">
                <div className="form-section">
                  <h3>Bus Information</h3>

                  <div className="form-group">
                    <label htmlFor="busNumber">Bus Number *</label>
                    <input
                      type="text"
                      id="busNumber"
                      name="busNumber"
                      value={newBus.busNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., OA-116"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="plateNumber">Plate Number *</label>
                    <input
                      type="text"
                      id="plateNumber"
                      name="plateNumber"
                      value={newBus.plateNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., ABC-123"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="capacity">Capacity *</label>
                    <input
                      type="number"
                      id="capacity"
                      name="capacity"
                      value={newBus.capacity}
                      onChange={handleInputChange}
                      placeholder="e.g., 45"
                      min="1"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="status">Status *</label>
                    <select
                      id="status"
                      name="status"
                      value={newBus.status}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="Active">Active</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="busPhoto">Upload Bus Photo</label>
                    <input
                      type="file"
                      id="busPhoto"
                      name="busPhoto"
                      accept="image/*"
                      onChange={handleBusPhotoUpload}
                    />
                  </div>

                  {newBus.busPhoto && (
                    <div className="bus-photo-placeholder add-bus-photo-preview">
                      <img src={newBus.busPhoto} alt="Bus preview" />
                    </div>
                  )}

                  {newBus.busPhoto && (
                    <button type="button" className="btn-cancel remove-photo-btn" onClick={removeBusPhoto}>
                      Remove Photo
                    </button>
                  )}
                </div>

                <div className="form-section">
                  <h3>Route Information</h3>

                  <div className="form-group">
                    <label htmlFor="route">Route *</label>
                    <input
                      type="text"
                      id="route"
                      name="route"
                      value={newBus.route}
                      onChange={handleInputChange}
                      placeholder="e.g., One Ayala - BGC"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="registeredDestination">Registered Destination *</label>
                    <input
                      type="text"
                      id="registeredDestination"
                      name="registeredDestination"
                      value={newBus.registeredDestination}
                      onChange={handleInputChange}
                      placeholder="e.g., Bonifacio Global City, Taguig"
                      required
                    />
                  </div>
                </div>

                <div className="form-section">
                  <h3>Bus Company</h3>

                  <div className="form-group">
                    <label htmlFor="busCompany">Company Name *</label>
                    <input
                      type="text"
                      id="busCompany"
                      name="busCompany"
                      value={newBus.busCompany}
                      onChange={handleInputChange}
                      placeholder="e.g., JAM Transit"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="busCompanyEmail">Company Email *</label>
                    <input
                      type="email"
                      id="busCompanyEmail"
                      name="busCompanyEmail"
                      value={newBus.busCompanyEmail}
                      onChange={handleInputChange}
                      placeholder="e.g., operations@company.com.ph"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="busCompanyContact">Company Contact *</label>
                    <input
                      type="tel"
                      id="busCompanyContact"
                      name="busCompanyContact"
                      value={newBus.busCompanyContact}
                      onChange={handleInputChange}
                      placeholder="e.g., +63 917 123 4567"
                      required
                    />
                  </div>
                </div>

                <div className="form-section highlight-section">
                  <h3>Bus Attendant (Source of Truth)</h3>

                  <div className="form-group">
                    <label htmlFor="busAttendant">Assigned Bus Attendant *</label>
                    <input
                      type="text"
                      id="busAttendant"
                      name="busAttendant"
                      value={newBus.busAttendant}
                      onChange={handleInputChange}
                      placeholder="e.g., Juan Dela Cruz"
                      required
                    />
                  </div>

                  <p className="info-note">
                    * The bus attendant is the primary source of truth for all bus information and operations.
                  </p>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeAddModal}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  Add Bus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bus Details Modal */}
      {showModal && selectedBus && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Bus Details</h2>
              <button className="close-btn" onClick={closeModal}>&times;</button>
            </div>

            <div className="modal-body">
              <div className="bus-photo-section">
                <div className="bus-photo-placeholder">
                  {selectedBus.busPhoto ? (
                    <img src={selectedBus.busPhoto} alt={`Bus ${selectedBus.busNumber}`} />
                  ) : (
                    <div className="no-photo">
                      <span>📷</span>
                      <p>No photo available</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bus-info-grid">
                <div className="info-section">
                  <h3>Bus Information</h3>
                  <div className="info-row">
                    <span className="info-label">Bus Number:</span>
                    <span className="info-value">{selectedBus.busNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Plate Number:</span>
                    <span className="info-value">{selectedBus.plateNumber}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Capacity:</span>
                    <span className="info-value">{selectedBus.capacity} passengers</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Status:</span>
                    <span className={`status-badge ${getStatusClass(selectedBus.status)}`}>
                      {selectedBus.status}
                    </span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Route Information</h3>
                  <div className="info-row">
                    <span className="info-label">Current Route:</span>
                    <span className="info-value">{selectedBus.route}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Registered Destination:</span>
                    <span className="info-value">{selectedBus.registeredDestination}</span>
                  </div>
                </div>

                <div className="info-section">
                  <h3>Bus Company</h3>
                  <div className="info-row">
                    <span className="info-label">Company Name:</span>
                    <span className="info-value">{selectedBus.busCompany}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Email:</span>
                    <span className="info-value">
                      <a href={`mailto:${selectedBus.busCompanyEmail}`}>{selectedBus.busCompanyEmail}</a>
                    </span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Contact Number:</span>
                    <span className="info-value">
                      <a href={`tel:${selectedBus.busCompanyContact}`}>{selectedBus.busCompanyContact}</a>
                    </span>
                  </div>
                </div>

                <div className="info-section highlight-section">
                  <h3>Bus Attendant (Source of Truth)</h3>
                  <div className="info-row">
                    <span className="info-label">Assigned Attendant:</span>
                    <span className="info-value attendant-name">{selectedBus.busAttendant}</span>
                  </div>
                  <p className="info-note">
                    * The bus attendant is the primary source of truth for all bus information and operations.
                  </p>
                </div>
              </div>

              <div className="modal-actions-row">
                {selectedBus.status === 'Archived' ? (
                  <>
                    <button
                      type="button"
                      className="table-action-btn restore"
                      onClick={() => handleUnarchiveBus(selectedBus.id)}
                    >
                      Unarchive
                    </button>
                    <button
                      type="button"
                      className="table-action-btn delete"
                      onClick={() => handleDeleteArchivedBus(selectedBus.id)}
                    >
                      Delete Permanently
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="table-action-btn archive"
                    onClick={() => handleArchiveBus(selectedBus.id)}
                  >
                    Archive Bus
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default Buses;