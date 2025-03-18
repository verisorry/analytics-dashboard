'use client';

import { useState, useEffect, useCallback } from "react";
import { Select, Card, Spin } from "antd";
import Button from "@/components/button";
import { DatabaseOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Line, Bar } from 'react-chartjs-2';
import { useWebSocket } from "@/app/WebSocketContext";
import { useSearchParams } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface SettingData {
  fridge_id: number;
  instrument_name: string;
  parameter_name: string;
  applied_value: number;
  timestamp: number;
}

export default function Analytics() {
  const [mode, setMode] = useState<string>("Dummy");

  const [data, setData] = useState<SettingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFridge, setSelectedFridge] = useState<string>("All Fridges");
  const [selectedInstrument, setSelectedInstrument] = useState<string>("All Instruments");
  const [selectedParameter, setSelectedParameter] = useState<string>("All Parameters");
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const { liveData, connect, isConnected } = useWebSocket();
  
  const [stats, setStats] = useState({
    averageValue: 0,
    minValue: 0,
    maxValue: 0,
    totalRecords: 0,
  });

  const calculateStats = useCallback((dataSet: SettingData[]) => {
    const filteredData = dataSet.filter(item => {
      if (selectedFridge !== "All Fridges" && item.fridge_id !== parseInt(selectedFridge)) return false;
      if (selectedInstrument !== "All Instruments" && item.instrument_name !== selectedInstrument) return false;
      if (selectedParameter !== "All Parameters" && item.parameter_name !== selectedParameter) return false;
      return true;
    });

    if (filteredData.length === 0) {
      setStats({
        averageValue: 0,
        minValue: 0,
        maxValue: 0,
        totalRecords: 0,
      });
      return;
    }

    const values = filteredData.map(item => item.applied_value);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    setStats({
      averageValue: parseFloat(average.toFixed(2)),
      minValue: min,
      maxValue: max,
      totalRecords: filteredData.length,
    });
  }, [selectedFridge, selectedInstrument, selectedParameter]);

  useEffect(() => {
    const initialiseAndFetch = async () => {
      setLoading(true);
      const urlMode = searchParams.get('mode');
      console.log("Analytics: URL mode:", urlMode);
      if (urlMode) {
        setMode(urlMode);
      }

      try {
        let response;

        if (urlMode === "Dummy") {
          response = await axios.get('http://localhost:8000/dummy');
          const settingsData = response?.data?.data || [];
          setData(settingsData);
          calculateStats(settingsData);


        } else if (urlMode === "Live") {
          connect();
          setData(liveData);
          calculateStats(liveData);
          setLoading(false);


        } else if (urlMode === "Historical") {
          try {
            const historicalData = localStorage.getItem('historicalData');
            if (historicalData) {
              const parsedData = JSON.parse(historicalData);
              setData(parsedData);
              calculateStats(parsedData);
            } else {
              console.error("Analytics: No historical data found");
            }
          } catch (error) {
            console.error("Analytics: Error loading historical data:", error);
          }
        }
      } catch (error) {
        console.error("Analytics: Error fetching data:", error);
        setData([]);
      } finally {
        setLoading(false);
      }
      
    };
    initialiseAndFetch();
  }, [searchParams, calculateStats, connect, liveData]);

  useEffect(() => {
    if (mode === "Live" && liveData.length > 0) {
      setData(liveData);
      calculateStats(liveData);
    }
  }, [liveData, mode, calculateStats]);

  const fridgeOptions = ["All Fridges", ...new Set(data.map(item => item.fridge_id.toString()))];
  const instrumentOptions = ["All Instruments", ...new Set(data.map(item => item.instrument_name))];
  const parameterOptions = ["All Parameters", ...new Set(data.map(item => item.parameter_name))];

  const prepareTimeSeriesData = () => {
    let filteredData = data.filter(item => {
      if (selectedFridge !== "All Fridges" && item.fridge_id !== parseInt(selectedFridge)) return false;
      if (selectedInstrument !== "All Instruments" && item.instrument_name !== selectedInstrument) return false;
      if (selectedParameter !== "All Parameters" && item.parameter_name !== selectedParameter) return false;
      return true;
    });

    filteredData = filteredData.sort((a, b) => a.timestamp - b.timestamp);

    const groupedByDay: Record<string, number[]> = {};
    filteredData.forEach(item => {
      const date = new Date(item.timestamp * 1000).toLocaleDateString();
      if (!groupedByDay[date]) {
        groupedByDay[date] = [];
      }
      groupedByDay[date].push(item.applied_value);
    });

    const labels = Object.keys(groupedByDay);
    const values = labels.map(date => {
      const dayValues = groupedByDay[date];
      return dayValues.reduce((sum, val) => sum + val, 0) / dayValues.length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Average Value',
          data: values,
          borderColor: '#3498DB',
          backgroundColor: '#3498DB',
          tension: 0.4,
        },
      ],
    };
  };

  const prepareParameterDistribution = () => {
    const filteredData = data.filter(item => {
      if (selectedFridge !== "All Fridges" && item.fridge_id !== parseInt(selectedFridge)) return false;
      if (selectedInstrument !== "All Instruments" && item.instrument_name !== selectedInstrument) return false;
      return true;
    });

    const groupedByParameter: Record<string, number[]> = {};
    filteredData.forEach(item => {
      if (!groupedByParameter[item.parameter_name]) {
        groupedByParameter[item.parameter_name] = [];
      }
      groupedByParameter[item.parameter_name].push(item.applied_value);
    });

    const labels = Object.keys(groupedByParameter);
    const values = labels.map(param => {
      const paramValues = groupedByParameter[param];
      return paramValues.reduce((sum, val) => sum + val, 0) / paramValues.length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Average Value by Parameter',
          data: values,
          backgroundColor: '#3498DB',
        },
      ],
    };
  };

  const prepareFridgeComparison = () => {
    const filteredData = data.filter(item => {
      if (selectedInstrument !== "All Instruments" && item.instrument_name !== selectedInstrument) return false;
      if (selectedParameter !== "All Parameters" && item.parameter_name !== selectedParameter) return false;
      return true;
    });

    const groupedByFridge: Record<string, number[]> = {};
    filteredData.forEach(item => {
      const fridgeId = `Fridge ${item.fridge_id}`;
      if (!groupedByFridge[fridgeId]) {
        groupedByFridge[fridgeId] = [];
      }
      groupedByFridge[fridgeId].push(item.applied_value);
    });

    const labels = Object.keys(groupedByFridge);
    const values = labels.map(fridge => {
      const fridgeValues = groupedByFridge[fridge];
      return fridgeValues.reduce((sum, val) => sum + val, 0) / fridgeValues.length;
    });

    return {
      labels,
      datasets: [
        {
          label: 'Average Value by Fridge',
          data: values,
          backgroundColor: '#3498DB',
        },
      ],
    };
  };

  const handleViewDashboard = () => {
    router.push('/');
  }

  return (
    <main className="analytics-page flex flex-col items-center justify-center w-auto m-6 my-[35%] md:my-[10%]">
      <section className="w-[90%] md:w-[80%] flex flex-col gap-12">
        <header className="analytics-header flex flex-col md:flex-row items-start md:items-end gap-6 md:justify-between">
          <header className="analytics-header-text flex flex-col items-start gap-2">
            <h1 className="analytics-title md:my-2">{mode} Instrument Analytics</h1>
            
            <h2 className="analytics-subtitle">View analytics and trends for instrument parameters</h2>
            
            {(() => {
              switch (mode) {
              case "Live":
                return (
                  <h2 className="accent">
                    {isConnected ? "Connected: Data updates in real-time every 2 seconds" : "Connecting to live data..."}
                  </h2>
                );
              case "Historical":
                return (
                  <h2 className="accent">
                    Historical mode generates random data with infinite scrolling
                  </h2>
                );
              case "Dummy":
                return (
                  <h2 className="accent">
                    Dummy mode uses static data
                  </h2>
                );
              default:
                return null;
              }
            })()}
          </header>
          
          <Button 
            text="View Dashboard"
            icon={<DatabaseOutlined />} 
            onClick={handleViewDashboard}
            label={true}
            className="w-full md:w-auto"
          />
        </header>

        <hr className="divider w-full border-t border-neutral-200" />

        <Spin spinning={loading}>
          <section className="filter-container grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={selectedFridge}
              onChange={setSelectedFridge}
              options={fridgeOptions.map(fridge => ({ value: fridge, label: fridge }))}
            />
            <Select
              value={selectedInstrument}
              onChange={setSelectedInstrument}
              options={instrumentOptions.map(instrument => ({ value: instrument, label: instrument }))}
            />
            <Select
              value={selectedParameter}
              onChange={setSelectedParameter}
              options={parameterOptions.map(parameter => ({ value: parameter, label: parameter }))}
            />
          </section>

          <section className="graph-container grid grid-cols-1 gap-18 mt-12">
            <section className="stats-container grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <h3 className="text-neutral-600">Average Value</h3>
              <p className="stats-value text-3xl font-bold">{stats.averageValue}</p>
            </Card>
            <Card>
              <h3 className="text-neutral-600">Minimum Value</h3>
              <p className="stats-value text-3xl font-bold">{stats.minValue}</p>
            </Card>
            <Card>
              <h3 className="text-neutral-600">Maximum Value</h3>
              <p className="stats-value text-3xl font-bold">{stats.maxValue}</p>
            </Card>
            <Card>
              <h3 className="text-neutral-600">Total Records</h3>
              <p className="stats-value text-3xl font-bold">{stats.totalRecords}</p>
            </Card>
            </section>

            <section className="line-chart-container">
              <h2 className="block md:hidden text-3xl font-medium mb-4 font-dm-sans">Value Trends</h2>
              <div className="line-chart-canvas w-full h-full">
                {data.length > 0 && (
                  <Line 
                    data={prepareTimeSeriesData()} 
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                        title: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                )}
              </div>
            </section>

            <section className="variable-charts-container grid grid-cols-1 md:grid-cols-2 gap-18 md:gap-6">
              <section className="variable-chart-1 md:p-4">
                <h2 className="text-3xl font-medium mb-4 font-dm-sans">Parameter Distribution</h2>
                {data.length > 0 && (
                  <Bar 
                    data={prepareParameterDistribution()} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                )}
              </section>

              <div className="variable-chart-2 md:p-4">
                <h2 className="text-3xl font-medium mb-4 font-dm-sans">Fridge Comparison</h2>
                {data.length > 0 && (
                  <Bar 
                    data={prepareFridgeComparison()} 
                    options={{
                      responsive: true,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                        },
                      },
                    }}
                  />
                )}
              </div>
            </section>

          </section>
          
        </Spin>
      </section>
    </main>
  );
}