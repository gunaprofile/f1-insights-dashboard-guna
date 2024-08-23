import React, { useState, useEffect, useMemo,Suspense, useCallback } from 'react';
import Select from 'react-select';
import ClipLoader from 'react-spinners/ClipLoader';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import { useSeasons } from './common/useSeasons';
import { useDrivers } from './common/useDrivers';
import { statisticsOptions as defaultStatisticsOptions, customStyles as defaultCustomStyles, apiBaseUrl } from '../constants';

const DriverComparisonChart = () => {
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [selectedDrivers, setSelectedDrivers] = useState([]);
  const [selectedStatistics, setSelectedStatistics] = useState([
    { value: 'points', label: 'Points' },
    { value: 'position', label: 'Position' },
    { value: 'fastestLap', label: 'Fastest Lap Time' }
  ]);
  const [chartData, setChartData] = useState({});
  const [loadingChart, setLoadingChart] = useState(false);
  const [errors, setErrors] = useState({
    seasons: null,
    drivers: null,
    chart: null,
    driversSelection: null,
    statisticsSelection: null,
  });

  const { seasons, loadingSeasons, errorSeasons } = useSeasons();
  const { drivers, loadingDrivers, errorDrivers } = useDrivers(selectedSeason);

  useEffect(() => {
    if (seasons.length > 0 && !selectedSeason) {
      setSelectedSeason(seasons[seasons.length - 1]);
    }
  }, [seasons, selectedSeason]);

  useEffect(() => {
    if (selectedSeason) {
      setSelectedDrivers([]);
      setErrors((prevErrors) => ({ ...prevErrors, driversSelection: null }));
    }
  }, [selectedSeason]);

  useEffect(() => {
    if (selectedSeason && drivers.length > 0 && !loadingDrivers) {
      setSelectedDrivers(drivers);
    }
  }, [selectedSeason, drivers, loadingDrivers]);

  // Check if all drivers are removed
  useEffect(() => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      driversSelection: selectedDrivers.length === 0 ? 'Please select at least one driver.' : null,
    }));
  }, [selectedDrivers]);

  // Check if all statistics are removed
  useEffect(() => {
    setErrors((prevErrors) => ({
      ...prevErrors,
      statisticsSelection: selectedStatistics.length === 0 ? 'Please select at least one statistic.' : null,
    }));
  }, [selectedStatistics]);

  const fetchChartData = useCallback(async () => {
    if (!selectedSeason || selectedDrivers.length === 0 || selectedStatistics.length === 0) return;

    setLoadingChart(true);
    try {
      const response = await fetch(`${apiBaseUrl}driver-comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          season: selectedSeason.value,
          drivers: selectedDrivers.map((driver) => driver.value),
          statistics: selectedStatistics.map((stat) => stat.value),
        }),
      });

      if (!response.ok) throw new Error('Failed to fetch chart data.');

      const data = await response.json();
      const transformedData = transformChartData(data);
      setChartData(transformedData);
      setErrors((prevErrors) => ({ ...prevErrors, chart: null }));
    } catch (error) {
      setErrors((prevErrors) => ({ ...prevErrors, chart: 'Error fetching chart data.' }));
    } finally {
      setLoadingChart(false);
    }
  }, [selectedSeason, selectedDrivers, selectedStatistics]);

  useEffect(() => {
    if (!loadingDrivers && selectedDrivers.length > 0 && selectedStatistics.length > 0) {
      const debounceFetch = setTimeout(() => fetchChartData(), 300);
      return () => clearTimeout(debounceFetch);
    }
  }, [fetchChartData, loadingDrivers, selectedDrivers, selectedStatistics]);

  const transformChartData = useCallback((data) => {
    const maxPosition = data.position?.length ? Math.max(...data.position.map((item) => item.value)) : 0;
    const maxFastestLap = data.fastestLap?.length ? Math.max(...data.fastestLap.map((item) => parseFloat(item.value))) : 0;

    return {
      position: data.position?.map((item) => ({
        ...item,
        invertedValue: maxPosition - item.value + 1,
        originalValue: item.value,
      })) || [],
      points: data.points?.map((item) => ({
        ...item,
        invertedValue: item.value,
        originalValue: item.value,
      })) || [],
      fastestLap: data.fastestLap?.map((item) => ({
        ...item,
        invertedValue: maxFastestLap - parseFloat(item.value) + 1,
        originalValue: parseFloat(item.value),
      })) || [],
    };
  }, []);

  const statisticsOptions = useMemo(() => defaultStatisticsOptions, []);
  const customStyles = useMemo(() => defaultCustomStyles, []);

  const chartOptions = useMemo(
    () => ({
      chart: { type: 'areaspline', height: 650, marginTop: 50 },
      title: { text: `Driver Comparison - ${selectedStatistics.map((stat) => stat.label).join(', ')}` },
      xAxis: { categories: selectedDrivers.map((driver) => driver.label), gridLineWidth: 0 },
      yAxis: selectedStatistics.map((stat, index) => ({
        title: { text: stat.label },
        opposite: index % 2 !== 0,
        gridLineWidth: 0,
      })),
      series: selectedStatistics.map((stat, index) => ({
        name: stat.label,
        data: chartData[stat.value]?.map((item) => item.invertedValue) || [],
        fillOpacity: 0.5,
        yAxis: index,
        color: index === 0 ? '#00473f' : index === 1 ? '#cedc00' : '#5191F0',
        tooltip: {
          pointFormatter: function () {
            const originalValue = chartData[stat.value]?.find((item) => item.name === this.category)?.originalValue;
            return `<span style="color:${this.color}">\u25CF</span> ${this.series.name}: <b>${originalValue}</b><br/>`;
          },
        },
      })),
      credits: { enabled: false },
      plotOptions: { areaspline: { fillOpacity: 0.5, marker: { enabled: false } } },
      legend: { align: 'center', verticalAlign: 'bottom', layout: 'horizontal' },
      tooltip: { shared: true },
    }),
    [chartData, selectedDrivers, selectedStatistics]
  );

  const hasErrors = Object.values(errors).some((error) => error);

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex space-x-4">
        <div className="w-2/12">
          <label className="block text-sm font-medium leading-6 text-gray-900">Season</label>
          <Select
            options={seasons}
            value={selectedSeason}
            onChange={setSelectedSeason}
            placeholder="Select a season"
            styles={customStyles}
            isDisabled={loadingSeasons}
            isLoading={loadingSeasons}
          />
        </div>
        <div className="w-7/12">
          <label className="block text-sm font-medium leading-6 text-gray-900">Drivers</label>
          <Select
            options={drivers}
            value={selectedDrivers}
            onChange={setSelectedDrivers}
            isMulti
            placeholder="Select drivers"
            styles={customStyles}
            isDisabled={loadingDrivers || !selectedSeason}
            isLoading={loadingDrivers}
            isSearchable
          />
        </div>
        <div className="w-3/12">
          <label className="block text-sm font-medium leading-6 text-gray-900">Statistics</label>
          <Select
            options={statisticsOptions}
            value={selectedStatistics}
            onChange={setSelectedStatistics}
            isMulti
            placeholder="Select statistics"
            isClearable
            styles={customStyles}
            isSearchable
          />
        </div>
      </div>
      <div className="mt-8">
        {loadingSeasons || loadingDrivers || loadingChart ? (
          <div className="flex justify-center items-center h-64">
            <ClipLoader size={50} color={"#123abc"} loading={loadingChart} />
          </div>
        ) : hasErrors ? (
          <div className="flex justify-center items-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center w-2/3" role="alert">
              <strong className="font-bold">Warning: </strong>
              <span className="block sm:inline">
                {errors.seasons || errors.drivers || errors.chart || errors.driversSelection || errors.statisticsSelection}
              </span>
            </div>
          </div>
        ) : (
          <Suspense fallback={<div>Loading chart...</div>}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </Suspense>
        )}
      </div>
    </div>
  );
};

export default DriverComparisonChart;
