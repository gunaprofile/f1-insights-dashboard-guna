import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import "@fortawesome/fontawesome-free/css/all.min.css";

const startYear = 1958;
const endYear = 2023;
const nbr = 15;

const BarRaceChart = () => {
  const chartComponent = useRef(null);
  const [dataset, setDataset] = useState(null);
  const [year, setYear] = useState(startYear);
  const [playing, setPlaying] = useState(false);
  const intervalRef = useRef(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(
        "http://localhost/api/constructor-points-progress"
      );
      const data = await response.json();
      setDataset(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getData = useCallback(
    (year) => {
      if (!dataset) return [];
      const output = Object.entries(dataset)
        .map(([teamName, teamData]) => [teamName, teamData[year] || 0])
        .sort((a, b) => b[1] - a[1]);

      return output.slice(0, nbr);
    },
    [dataset]
  );

  const updateChart = useCallback(
    (newYear) => {
      if (chartComponent.current) {
        chartComponent.current.chart.update(
          {
            series: [
              {
                name: newYear,
                data: getData(newYear),
              },
            ],
          },
          false,
          false,
          false
        );
      }
    },
    [getData]
  );

  const handleYearChange = (newYear) => {
    setYear(newYear);
    updateChart(newYear);
  };

  const play = () => {
    setPlaying(true);
    intervalRef.current = setInterval(() => {
      setYear((prevYear) => {
        const nextYear = prevYear + 1;
        if (nextYear > endYear) {
          pause();
          return prevYear;
        }
        updateChart(nextYear);
        return nextYear;
      });
    }, 1500);
  };

  const pause = () => {
    clearInterval(intervalRef.current);
    setPlaying(false);
  };

  const togglePlayPause = () => {
    if (playing) {
      pause();
    } else {
      play();
    }
  };

  const chartOptions = useMemo(
    () => ({
      chart: {
        type: "bar",
        animation: true,
        height: 800,
        width: 1750,
      },
      title: {
        text: `Team's Points Progression Over the Years ${year}`,
        align: "center",
      },
      credits: {
        enabled: false,
      },
      legend: {
        enabled: false,
      },
      xAxis: {
        type: "category",
        title: {
          text: "Teams",
        },
        gridLineWidth: 0,
      },
      yAxis: {
        opposite: true,
        tickPixelInterval: 80,
        title: {
          text: "Points",
        },
        gridLineWidth: 0,
      },
      plotOptions: {
        series: {
          animation: true,
          groupPadding: 0,
          pointPadding: 0.1,
          borderWidth: 2, // Set the border width for the bars
          borderColor: "#000", // Set the border color for the bars
          colorByPoint: true,
          fillOpacity: 0.8, // Set opacity for the bars
          dataSorting: {
            enabled: true,
            matchByName: true,
          },
          dataLabels: {
            enabled: true,
          },
        },
      },
      colors: [
        "#4caefe",
        "#3fbdf3",
        "#35c3e8",
        "#2bc9dc",
        "#20cfe1",
        "#16d4e6",
        "#0dd9db",
        "#03dfd0",
        "#00e4c5",
        "#00e9ba",
        "#00eeaf",
        "#23e274",
      ],
      series: [
        {
          name: year,
          data: getData(year),
        },
      ],
    }),
    [year, getData]
  );

  return (
    <div className="w-full flex flex-col p-4">
      <div className="flex items-center justify-center space-x-4 mb-4">
        <button
          onClick={togglePlayPause}
          className="text-black bg-aston_yellow hover:bg-red-500 p-3 rounded-lg"
        >
          <i className={`fas ${playing ? "fa-pause" : "fa-play"}`}></i>
        </button>
        <input
          type="range"
          value={year}
          min={startYear}
          max={endYear}
          onChange={(e) => handleYearChange(Number(e.target.value))}
          className="w-11/12 bg-aston_widget_green"
        />
      </div>
      <HighchartsReact
        highcharts={Highcharts}
        options={chartOptions}
        ref={chartComponent}
      />
    </div>
  );
};

export default BarRaceChart;
