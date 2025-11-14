import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';

import { Truck, Driver, DriverSchedule, ShiftTemplate } from '@/types';
import { mockTrucks, mockDrivers, mockSchedules, mockShiftTemplates } from '@/mocks/fleet';

export const [FleetContext, useFleet] = createContextHook(() => {
  const [trucks, setTrucks] = useState<Truck[]>(mockTrucks);
  const [drivers, setDrivers] = useState<Driver[]>(mockDrivers);
  const [schedules, setSchedules] = useState<DriverSchedule[]>(mockSchedules);
  const [shiftTemplates] = useState<ShiftTemplate[]>(mockShiftTemplates);

  const getTruckById = useCallback(
    (id: string) => trucks.find((t) => t.id === id),
    [trucks]
  );

  const getDriverById = useCallback(
    (id: string) => drivers.find((d) => d.id === id),
    [drivers]
  );

  const getDriverSchedules = useCallback(
    (driverId: string, startDate?: string, endDate?: string) => {
      return schedules.filter((s) => {
        if (s.driverId !== driverId) return false;
        if (startDate && s.date < startDate) return false;
        if (endDate && s.date > endDate) return false;
        return true;
      });
    },
    [schedules]
  );

  const addTruck = useCallback((truck: Omit<Truck, 'id'>) => {
    const newTruck: Truck = {
      ...truck,
      id: `truck_${Date.now()}`,
    };
    setTrucks((prev) => [newTruck, ...prev]);
    return newTruck;
  }, []);

  const updateTruck = useCallback((id: string, updates: Partial<Truck>) => {
    setTrucks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
    );
  }, []);

  const deleteTruck = useCallback((id: string) => {
    setTrucks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addDriver = useCallback((driver: Omit<Driver, 'id'>) => {
    const newDriver: Driver = {
      ...driver,
      id: `driver_${Date.now()}`,
    };
    setDrivers((prev) => [newDriver, ...prev]);
    return newDriver;
  }, []);

  const updateDriver = useCallback((id: string, updates: Partial<Driver>) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === id ? { ...d, ...updates } : d))
    );
  }, []);

  const deleteDriver = useCallback((id: string) => {
    setDrivers((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const addSchedule = useCallback((schedule: Omit<DriverSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newSchedule: DriverSchedule = {
      ...schedule,
      id: `schedule_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSchedules((prev) => [newSchedule, ...prev]);
    return newSchedule;
  }, []);

  const updateSchedule = useCallback((id: string, updates: Partial<DriverSchedule>) => {
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === id
          ? { ...s, ...updates, updatedAt: new Date().toISOString() }
          : s
      )
    );
  }, []);

  const deleteSchedule = useCallback((id: string) => {
    setSchedules((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const assignDriverToTruck = useCallback((driverId: string, truckId: string) => {
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, assignedTruckId: truckId } : d))
    );
    setTrucks((prev) =>
      prev.map((t) => (t.id === truckId ? { ...t, assignedDriverId: driverId } : t))
    );
  }, []);

  const unassignDriverFromTruck = useCallback((driverId: string) => {
    const driver = drivers.find((d) => d.id === driverId);
    if (driver?.assignedTruckId) {
      setTrucks((prev) =>
        prev.map((t) =>
          t.id === driver.assignedTruckId ? { ...t, assignedDriverId: undefined } : t
        )
      );
    }
    setDrivers((prev) =>
      prev.map((d) => (d.id === driverId ? { ...d, assignedTruckId: undefined } : d))
    );
  }, [drivers]);

  const availableTrucks = useMemo(
    () => trucks.filter((t) => t.status === 'available'),
    [trucks]
  );

  const activeDrivers = useMemo(
    () => drivers.filter((d) => d.status === 'active'),
    [drivers]
  );

  return useMemo(
    () => ({
      trucks,
      drivers,
      schedules,
      shiftTemplates,
      getTruckById,
      getDriverById,
      getDriverSchedules,
      addTruck,
      updateTruck,
      deleteTruck,
      addDriver,
      updateDriver,
      deleteDriver,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      assignDriverToTruck,
      unassignDriverFromTruck,
      availableTrucks,
      activeDrivers,
    }),
    [
      trucks,
      drivers,
      schedules,
      shiftTemplates,
      getTruckById,
      getDriverById,
      getDriverSchedules,
      addTruck,
      updateTruck,
      deleteTruck,
      addDriver,
      updateDriver,
      deleteDriver,
      addSchedule,
      updateSchedule,
      deleteSchedule,
      assignDriverToTruck,
      unassignDriverFromTruck,
      availableTrucks,
      activeDrivers,
    ]
  );
});
