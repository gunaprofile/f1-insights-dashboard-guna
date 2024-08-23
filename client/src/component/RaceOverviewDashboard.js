import React, { useState, useEffect, useMemo, useCallback } from "react";
import DashboardWidget from "./common/DashboardWidget";
import WidgetShimmer from "./common/WidgetShimmer";
import { WIDGET_API_URLS } from '../constants';
import { toast } from "react-toastify";
import DriverComparisonChart from './DriverComparisonChart';

// Utility function for fetching data with error handling
const fetchDataWithErrorHandling = async (url) => {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        toast.error(`Error fetching data from ${url}: ${error.message}`);
        return null; // Return null to handle failure gracefully
    }
};

const RaceOverviewDashboard = () => {
    const [widgetsData, setWidgetsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [countdown, setCountdown] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });
    const [targetDate, setTargetDate] = useState(null);
    const [raceInfo, setRaceInfo] = useState(null);

    // Fetch and process widget data
    const fetchWidgetsData = useCallback(async () => {
        try {
            setLoading(true);
            const [racesCompletedRes, standingsRes, statusRes, countdownRes] = await Promise.all(
                WIDGET_API_URLS.map(fetchDataWithErrorHandling)
            );

            if (countdownRes) {
                const raceDate = new Date(`${countdownRes.date}T${countdownRes.time}`);
                setTargetDate(raceDate);
                setRaceInfo(countdownRes);
            }

            const widgets = [];

            if (racesCompletedRes) {
                widgets.push({
                    title: `Completed in current season`,
                    sections: [{ number: racesCompletedRes.racesCompleted, label: "Races" }],
                });
            }

            if (standingsRes) {
                widgets.push({
                    title: "Standings",
                    sections: [
                        { number: standingsRes.points, label: "Points" },
                        { number: standingsRes.position, label: "Position" },
                        { number: standingsRes.round, label: "Round" },
                        { number: standingsRes.wins, label: "Wins" },
                    ],
                });
            }

            if (statusRes) {
                widgets.push({
                    title: statusRes.title,
                    sections: statusRes.sections,
                });
            }

            setWidgetsData(widgets);
        } catch (err) {
            setError("Failed to fetch data.");
            toast.error("An unexpected error occurred.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchWidgetsData();
    }, [fetchWidgetsData]);

    // Update countdown timer
    useEffect(() => {
        if (!targetDate) return;

        const updateCountdown = () => {
            const now = new Date();
            const timeDifference = targetDate - now;

            if (timeDifference <= 0) {
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            setCountdown({
                days: Math.floor(timeDifference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((timeDifference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((timeDifference / 1000 / 60) % 60),
                seconds: Math.floor((timeDifference / 1000) % 60),
            });
        };

        const intervalId = setInterval(updateCountdown, 1000);
        return () => clearInterval(intervalId);
    }, [targetDate]);

    const countdownWidget = useMemo(() => {
        if (!raceInfo) return null;
        return (
            <div className="flex-1">
                <DashboardWidget
                    title={`Countdown - ${raceInfo.raceName} - ${raceInfo.season}`}
                    sections={[
                        { number: countdown.days, label: "days" },
                        { number: countdown.hours, label: "hrs" },
                        { number: countdown.minutes, label: "mins" },
                        { number: countdown.seconds, label: "secs" },
                    ]}
                />
            </div>
        );
    }, [raceInfo, countdown]);

    if (loading) return <WidgetShimmer />;
    if (error) return null; // Error already handled by toast

    return (
        <main className="w-full mx-auto py-5 px-5">
            <section className="flex justify-between space-x-4">
                {widgetsData.map((widget, index) => (
                    <div key={index} className="flex-1">
                        <DashboardWidget title={widget.title} sections={widget.sections} />
                    </div>
                ))}
                {countdownWidget}
            </section>

            <section className="mt-8">
                <DriverComparisonChart />
            </section>
        </main>
    );
};

export default RaceOverviewDashboard;
