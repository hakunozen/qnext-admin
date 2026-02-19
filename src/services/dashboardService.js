import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { getBusesData } from '../data/busesData';

const DASHBOARD_DATA_SOURCE = (import.meta.env.VITE_DASHBOARD_DATA_SOURCE || 'local').toLowerCase();

const normalizeTimestamp = (value) => {
  if (typeof value === 'number') {
    return value;
  }

  if (value instanceof Date) {
    return value.getTime();
  }

  if (value && typeof value.toMillis === 'function') {
    return value.toMillis();
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  return Date.now();
};

const mapBusDocument = (docSnapshot) => {
  const bus = docSnapshot.data() || {};

  return {
    id: docSnapshot.id,
    busNumber: bus.busNumber || 'N/A',
    route: bus.route || 'N/A',
    busCompany: bus.busCompany || 'N/A',
    status: bus.status || 'Inactive',
    plateNumber: bus.plateNumber || 'N/A',
    capacity: Number(bus.capacity || 0),
    busAttendant: bus.busAttendant || 'N/A',
    busCompanyEmail: bus.busCompanyEmail || '',
    busCompanyContact: bus.busCompanyContact || '',
    registeredDestination: bus.registeredDestination || '',
    busPhoto: bus.busPhoto || null,
    lastUpdated: normalizeTimestamp(bus.lastUpdated),
  };
};

export const getDashboardTempBuses = () => getBusesData();

export const fetchBusesFromFirebase = async () => {
  const snapshot = await getDocs(collection(db, 'buses'));
  return snapshot.docs.map(mapBusDocument);
};

export const fetchDashboardBuses = async () => {
  const temporaryData = getDashboardTempBuses();

  if (DASHBOARD_DATA_SOURCE !== 'firebase') {
    return temporaryData;
  }

  try {
    const firebaseBuses = await fetchBusesFromFirebase();

    if (firebaseBuses.length > 0) {
      return firebaseBuses;
    }
  } catch (error) {
    console.error('Failed to fetch dashboard data from Firebase:', error);
  }

  return temporaryData;
};
