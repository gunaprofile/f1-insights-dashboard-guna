import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import timeline from 'highcharts/modules/timeline';
import Select from 'react-select';
import ClipLoader from 'react-spinners/ClipLoader';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { useSeasons } from './common/useSeasons';
import { customStyles as defaultCustomStyles, apiBaseUrl } from '../constants';

// Initialize the timeline module
timeline(Highcharts);

const TimelineRaceChart = () => {
  const { seasons, loadingSeasons, errorSeasons } = useSeasons();
  const [races, setRaces] = useState([]);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedRace, setSelectedRace] = useState(null);
  const [eventsData, setEventsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [noDataWarning, setNoDataWarning] = useState(false);

  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Auto-select the current season when seasons are available
  useEffect(() => {
    if (seasons.length) {
      const defaultSeason = seasons.find(
        (season) => season.value === currentYear.toString()
      );
      setSelectedSeason(defaultSeason || null);
    }
  }, [seasons, currentYear]);

  const fetchRaces = useCallback(async (season) => {
    try {
      const response = await fetch(`${apiBaseUrl}races/${season}`);
      const data = await response.json();
      const raceOptions = data.map((race) => ({
        value: race.round,
        label: `${race.raceName} - ${race.date}`,
      }));
      setRaces(raceOptions);

      if (raceOptions.length > 0) {
        setSelectedRace(raceOptions[0]);
      }
    } catch (error) {
      console.error('Error fetching races:', error);
    }
  }, []);

  const fetchRaceData = useCallback(async (season, round) => {
    try {
      setLoading(true);
      setNoDataWarning(false);

      const [raceResponse, driverResponse] = await Promise.all([
        fetch(`${apiBaseUrl}race/${season}/${round}`),
        fetch(`${apiBaseUrl}drivers/${season}`),
      ]);

      const raceData = await raceResponse.json();
      const driverData = await driverResponse.json();

      const driverNames = driverData.reduce((acc, driver) => {
        acc[driver.driverId] = `${driver.givenName} ${driver.familyName}`;
        return acc;
      }, {});

      const events = [];

      raceData.pitStops.forEach((stop) => {
        events.push({
          name: driverNames[stop.driverId],
          description: `Lap ${stop.lap}: Pit stop duration of ${stop.duration} seconds.`,
          time: stop.time,
          driverId: stop.driverId,
        });
      });

      raceData.laps.forEach((lap) => {
        lap.timings.forEach((timing) => {
          events.push({
            name: `${driverNames[timing.driverId]} Lap Time`,
            description: `Lap ${lap.lap}: Time - ${timing.time}`,
            time: `12:${parseInt(timing.time.split(':')[1], 10) + parseInt(lap.lap, 10)}:${timing.time.split(':')[2]}`,
            driverId: timing.driverId,
          });
        });
      });

      events.sort((a, b) => new Date(`2023-01-01T${a.time}Z`) - new Date(`2023-01-01T${b.time}Z`));

      setEventsData(events);

      if (events.length === 0) {
        setNoDataWarning(true);
      }
    } catch (error) {
      console.error('Error fetching race data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedSeason) {
      fetchRaces(selectedSeason.value);
    }
  }, [selectedSeason, fetchRaces]);

  useEffect(() => {
    if (selectedSeason && selectedRace) {
      fetchRaceData(selectedSeason.value, selectedRace.value);
    }
  }, [selectedSeason, selectedRace, fetchRaceData]);

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: 'timeline',
        width: 1700,
        height: 700,
        plotBackgroundColor: '#F0F1DE', // Set the background color of the plot area
        plotBorderColor: '#cedc00', // Set the border color of the plot area
        plotBorderWidth: 3, // Set the border width of the plot area
      },
      title: {
        text: `Race Analysis - ${selectedRace?.label || ''}`,
      },
      credits: {
        enabled: false,
      },
      xAxis: {
        type: 'datetime',
        labels: {
          format: '{value:%H:%M:%S}',
          style: {
            color: '#00241F', // Set the label color for the x-axis
          }
        },
      },
      yAxis: {
        title: {
          text: 'Race Events',
        },
        categories: ['Lap 1', 'Lap 2', 'Pit Stop', 'Lap Time'],
      },
      series: [
        {
          data: eventsData.map((event) => ({
            name: event.name,
            description: event.description,
            x: new Date(`2023-01-01T${event.time}Z`).getTime(),
            label: event.time,
            marker: {
              symbol: event.driverId ? 'circle' : 'diamond',
              fillColor: event.driverId ? '#FF0000' : '#0000FF',
            },
          })),
        },
      ],
      tooltip: {
        style: {
          width: '300px',
        },
      },
      plotOptions: {
        timeline: {
          dataLabels: {
            allowOverlap: false,
            format: '<span style="color:{point.color}">{point.name}</span><br/>{point.description}',
          },
        },
      },
    }),
    [eventsData, selectedRace]
  );

  if (loadingSeasons || errorSeasons) {
    return (
      <div className="flex justify-center items-center h-64">
        <ClipLoader size={50} color={"#123abc"} loading={loadingSeasons} />
        {errorSeasons && (
          <div className="text-red-500">Failed to load seasons.</div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 p-12">
      <div className="flex space-x-4">
        <div className="w-1/12">
          <label className="block text-sm font-medium leading-6 text-gray-900">Season</label>
          <Select
            options={seasons}
            value={selectedSeason}
            onChange={setSelectedSeason}
            placeholder="Select Season"
            styles={defaultCustomStyles}
            isLoading={loadingSeasons}
            isDisabled={loadingSeasons || errorSeasons}
          />
        </div>
        <div className="w-3/12">
          <label className="block text-sm font-medium leading-6 text-gray-900">Race</label>
          <Select
            options={races}
            value={selectedRace}
            onChange={setSelectedRace}
            placeholder="Select Race"
            styles={defaultCustomStyles}
            isDisabled={!selectedSeason || loading}
          />
        </div>
      </div>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <ClipLoader size={50} color={"#123abc"} loading={loading} />
        </div>
      ) : noDataWarning ? (
        <div className="flex justify-center items-center h-64">
          <div className="bg-red-100 border border-red-500 text-red-600 px-4 py-3 rounded relative text-center w-3/4">
            <strong className="font-bold">No Data Found!</strong>
            <span className="block sm:inline">
              Unfortunately, no data is available for the selected race.
            </span>
          </div>
        </div>
      ) : (
        <HighchartsReact highcharts={Highcharts} options={chartOptions} />
      )}
    </div>
  );
};

export default TimelineRaceChart;
