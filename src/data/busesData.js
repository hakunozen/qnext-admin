import rawInitialBuses from './busesData.json';

const BUS_STORAGE_KEY = 'qnext_admin_buses';
const ARCHIVED_BUS_STORAGE_KEY = 'qnext_admin_archived_buses';

export const initialBuses = rawInitialBuses.map((bus) => ({
  ...bus,
  capacity: Number(bus.capacity || 0),
  lastUpdated: Number(bus.lastUpdated || Date.now()),
}));

export const getBusesData = () => {
  try {
    const storedBuses = localStorage.getItem(BUS_STORAGE_KEY);
    if (storedBuses) {
      const parsedBuses = JSON.parse(storedBuses);
      if (Array.isArray(parsedBuses)) {
        return parsedBuses;
      }
    }
  } catch (error) {
    console.error('Failed to read buses from storage:', error);
  }

  return initialBuses;
};

export const saveBusesData = (buses) => {
  try {
    localStorage.setItem(BUS_STORAGE_KEY, JSON.stringify(buses));
  } catch (error) {
    console.error('Failed to save buses to storage:', error);
  }
};

export const getArchivedBusesData = () => {
  try {
    const storedArchivedBuses = localStorage.getItem(ARCHIVED_BUS_STORAGE_KEY);
    if (storedArchivedBuses) {
      const parsedArchivedBuses = JSON.parse(storedArchivedBuses);
      if (Array.isArray(parsedArchivedBuses)) {
        return parsedArchivedBuses;
      }
    }
  } catch (error) {
    console.error('Failed to read archived buses from storage:', error);
  }

  return [];
};

export const saveArchivedBusesData = (archivedBuses) => {
  try {
    localStorage.setItem(ARCHIVED_BUS_STORAGE_KEY, JSON.stringify(archivedBuses));
  } catch (error) {
    console.error('Failed to save archived buses to storage:', error);
  }
};
