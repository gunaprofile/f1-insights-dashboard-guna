import { useState, useEffect } from 'react';
import { apiBaseUrl } from "../../constants";

export const useDrivers = (selectedSeason) => {
    const [drivers, setDrivers] = useState([]);
    const [loadingDrivers, setLoadingDrivers] = useState(false);
    const [errorDrivers, setErrorDrivers] = useState(null);

    useEffect(() => {
        if (!selectedSeason) return;

        const fetchDrivers = async () => {
            setLoadingDrivers(true);
            setErrorDrivers(null);

            try {
                const response = await fetch(`${apiBaseUrl}drivers/${selectedSeason.value}`);
                if (!response.ok) throw new Error("Failed to fetch drivers");
                const result = await response.json();

                const driverOptions = result.map((driver) => ({
                    value: driver.driverId,
                    label: `${driver.givenName} ${driver.familyName}`,
                }));

                setDrivers(driverOptions);

                // Show an error if no drivers are found
                if (driverOptions.length === 0) {
                    setErrorDrivers('No drivers available for the selected season.');
                }
            } catch (error) {
                setErrorDrivers('Error fetching drivers.');
            } finally {
                setLoadingDrivers(false);
            }
        };

        const debounceFetch = setTimeout(() => fetchDrivers(), 300);

        return () => clearTimeout(debounceFetch);
    }, [selectedSeason]);

    // Additional effect to handle the case when all drivers are removed
    useEffect(() => {
        if (!loadingDrivers && drivers.length === 0 && !errorDrivers) {
            setErrorDrivers('All drivers have been removed.');
        }
    }, [drivers, loadingDrivers, errorDrivers]);

    return { drivers, loadingDrivers, errorDrivers };
};
