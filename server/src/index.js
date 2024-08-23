const express = require("express");
const cors = require("cors");
const axios = require("axios");
const config = require("./config");
const utils = require("./utils");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 80;

// Endpoint to get the number of races completed
app.get("/api/races-completed", async (req, res) => {
    try {
        const response = await axios.get(`${config.ergastApiBaseUrl}current.json`);
        const season = response.data.MRData.RaceTable.season;
        const racesCompleted = response.data.MRData.total;
        res.json({ season: season, racesCompleted });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch race data" });
    }
});

// Endpoint to get Aston Martin's current standings
app.get("/api/aston-martin-standings", async (req, res) => {
    try {
        const response = await axios.get(
            `${config.ergastApiBaseUrl}current/constructors/aston_martin/constructorStandings.json`
        );
        const standings =
            response.data.MRData.StandingsTable.StandingsLists[0].ConstructorStandings[0];
        const points = standings.points;
        const position = utils.getOrdinalSuffix(standings.position);
        const round = utils.getOrdinalSuffix(response.data.MRData.StandingsTable.StandingsLists[0].round);
        const wins = standings.wins;
        res.json({ points, position, round, wins });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch standings data" });
    }
});

// Endpoint to get Aston Martin's current status
app.get("/api/current-status", async (req, res) => {
    try {
        const response = await axios.get(
            `${config.ergastApiBaseUrl}current/constructors/aston_martin/status.json`
        );
        const statusData = response.data.MRData.StatusTable.Status.map((status) => ({
            number: parseInt(status.count, 10),
            label: status.status,
        }));
        res.json({
            title: "Status",
            sections: statusData,
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch standings data" });
    }
});

// Endpoint to get the countdown for the next race
app.get("/api/countdown", async (req, res) => {
    try {
        const response = await axios.get(`${config.ergastApiBaseUrl}current/next.json`);
        const race = response.data.MRData.RaceTable.Races[0];
        res.json({
            raceName: race.raceName,
            season: race.season,
            date: race.date,
            time: race.time
        });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch countdown data" });
    }
});

// Endpoint to all seasons team points progression
app.get("/api/constructor-points-progress", async (req, res) => {
    try {
        const response = await axios.get(
            `${config.ergastApiBaseUrl}constructorStandings.json?offset=0&limit=910`
        );
        const standingsLists = response.data.MRData.StandingsTable.StandingsLists;
        const data = {};
        standingsLists.forEach((season) => {
            season.ConstructorStandings.forEach((standing) => {
                const teamName = standing.Constructor.name;
                if (!data[teamName]) {
                    data[teamName] = {};
                }
                data[teamName][season.season] = parseInt(standing.points, 10);
            });
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch constructor points data" });
    }
});

// Endpoint to all seasons
app.get('/api/seasons', async (req, res) => {
    try {
        const response = await axios.get(`${config.ergastApiBaseUrl}seasons.json?limit=100`);
        const seasons = response.data.MRData.SeasonTable.Seasons.map(season => season.season);
        res.json(seasons);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch seasons data" });
    }
});

// Endpoint to all drivers of season
app.get('/api/drivers/:season', async (req, res) => {
    const { season } = req.params;
    try {
        const response = await axios.get(`${config.ergastApiBaseUrl}${season}/drivers.json`);
        const drivers = response.data.MRData.DriverTable.Drivers;
        res.json(drivers);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
});

// Endpoint to compare drivers
app.post('/api/driver-comparison', async (req, res) => {
    try {
        const { season, drivers, statistics } = req.body;

        if (!season || !drivers || !statistics || statistics.length === 0) {
            return res.status(400).json({ error: 'Invalid input parameters' });
        }

        const driverDataPromises = drivers.map(driverId => {
            const url = `${config.ergastApiBaseUrl}${season}/drivers/${driverId}/driverStandings.json`;
            return axios.get(url);
        });
        const results = await Promise.all(driverDataPromises);
        const comparisonData = {};

        for (const stat of statistics) {
            comparisonData[stat] = await Promise.all(
                results.map(async (response, index) => {
                    // Check if the data exists before accessing it
                    const standingsTable = response.data?.MRData?.StandingsTable?.StandingsLists;
                    if (!standingsTable || standingsTable.length === 0) {
                        console.error(`No standings data found for driver: ${drivers[index]} in season: ${season}`);
                        return { name: drivers[index], value: null }; // Return null for missing data
                    }
                    const driverStats = standingsTable[0]?.DriverStandings?.[0];
                    if (!driverStats) {
                        console.error(`Driver standings not found for driver: ${drivers[index]} in season: ${season}`);
                        return { name: drivers[index], value: null };
                    }
                    let value;
                    switch (stat) {
                        case 'position':
                            value = parseInt(driverStats.position, 10);
                            break;
                        case 'points':
                            value = parseFloat(driverStats.points);
                            break;
                        case 'fastestLap':
                            value = await fetchFastestLapTime(season, drivers[index]);
                            break;
                        default:
                            value = null;
                    }
                    return {
                        name: `${driverStats.Driver.givenName} ${driverStats.Driver.familyName}`,
                        value: value
                    };
                })
            );
        }

        res.json(comparisonData);
    } catch (error) {
        console.error('Error fetching driver comparison data:', error.message);
        res.status(500).json({ error: 'Failed to fetch driver comparison data' });
    }
});


async function fetchFastestLapTime(season, driverId) {
    try {
        const url = `${config.ergastApiBaseUrl}${season}/drivers/${driverId}/results.json`;
        const response = await axios.get(url);
        const races = response.data.MRData.RaceTable.Races;

        const fastestLaps = races
            .map(race => {
                const driverResult = race.Results.find(result => result.Driver.driverId === driverId);
                if (driverResult && driverResult.FastestLap) {
                    const timeString = driverResult.FastestLap.Time.time;
                    const [minutes, seconds] = timeString.split(":").map(parseFloat);
                    return minutes * 60 + seconds;
                }
                return null;
            })
            .filter(time => time !== null);

        if (fastestLaps.length === 0) {
            return null; // Handle case where no lap times are available
        }
        const averageFastestLapTime = fastestLaps.reduce((acc, curr) => acc + curr, 0) / fastestLaps.length;
        return averageFastestLapTime.toFixed(2); // Return the average in seconds
    } catch (error) {
        console.error(`Error fetching fastest lap time for ${driverId} in ${season}:`, error.message);
        return null;
    }
}

app.get('/api/races/:season', async (req, res) => {
    const { season } = req.params;
    try {
        const response = await axios.get(`${config.ergastApiBaseUrl}${season}.json?limit=100`);
        const races = response.data.MRData.RaceTable.Races;
        res.json(races);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch races' });
    }
});

app.get('/api/race/:season/:round', async (req, res) => {
    const { season, round } = req.params;
    try {
        // Fetch pit stops data
        const pitStopsResponse = await axios.get(`${config.ergastApiBaseUrl}${season}/${round}/pitstops.json`);
        const pitStopsData = pitStopsResponse.data.MRData.RaceTable.Races[0]?.PitStops || [];
        // Fetch lap timings data
        const lapsResponse = await axios.get(`${config.ergastApiBaseUrl}${season}/${round}/laps.json`);
        const lapsData = lapsResponse.data.MRData.RaceTable.Races[0]?.Laps || [];
        // Format the response
        const raceData = {
            laps: lapsData.map((lap) => ({
                lap: parseInt(lap.number, 10),
                timings: lap.Timings.map((timing) => ({
                    driverId: timing.driverId,
                    time: timing.time,
                })),
            })),
            pitStops: pitStopsData.map((stop) => ({
                driverId: stop.driverId,
                lap: parseInt(stop.lap, 10),
                stop: parseInt(stop.stop, 10),
                time: stop.time,
                duration: stop.duration,
            })),
        };
        res.json(raceData);
    } catch (error) {
        console.error('Error fetching race data:', error);
        res.status(500).json({ error: 'Failed to fetch race data' });
    }
});


// Endpoint to fetch all drivers for a specific season
app.get('/api/drivers/:season', async (req, res) => {
    const { season } = req.params;
    try {
        const response = await axios.get(`${config.ergastApiBaseUrl}${season}/drivers.json`);
        const drivers = response.data.MRData.DriverTable.Drivers.map(driver => ({
            driverId: driver.driverId,
            name: `${driver.givenName} ${driver.familyName}`
        }));
        res.json(drivers);
    } catch (error) {
        console.error('Error fetching drivers:', error);
        res.status(500).json({ error: 'Failed to fetch drivers' });
    }
});
