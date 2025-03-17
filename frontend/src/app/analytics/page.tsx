'use client';

import { useState, useEffect, useCallback } from "react";
import { Select, Card, Spin } from "antd";
import Button from "@/components/button";
import { DatabaseOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { Line, Bar } from 'react-chartjs-2';
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
  const [data, setData] = useState<SettingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFridge, setSelectedFridge] = useState<string>("All Fridges");
  const [selectedInstrument, setSelectedInstrument] = useState<string>("All Instruments");
  const [selectedParameter, setSelectedParameter] = useState<string>("All Parameters");
  const [mode, setMode] = useState<string>("Dummy");
  const router = useRouter();
  
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
    const savedMode = localStorage.getItem('mode');
    if (savedMode) {
      setMode(savedMode);
    }
  }, []);


  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        let response;
        
        if (mode === "Dummy") {
          response = await axios.get('http://localhost:8000/dummy');
        } else if (mode === "Live") {
          response = await axios.get('http://localhost:8000/live');
        } else if (mode === "Historical") {
          response = await axios.get('http://localhost:8000/historical', {
            params: { page: 1, page_size: 1000 }
          });
        }
        
        const settingsData = response?.data?.data || [];
        setData(settingsData);
        calculateStats(settingsData);
      } catch (error) {
        console.error(`Error fetching ${mode} data:`, error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [mode, calculateStats]);

  useEffect(() => {
    if (data.length > 0) {
      calculateStats(data);
    }
  }, [data, calculateStats]);

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
    <div className="analytics-page flex flex-col items-center p-6 py-[10%]">
      <div className="w-[80%] flex flex-col gap-12">
        <div className="analytics-header flex items-end justify-between">
          <div className="analytics-header-text flex flex-col items-start gap-2">
            <h1 className="analytics-title text-5xl font-bold">{mode} Instrument Analytics</h1>
            <p className="analytics-subtitle text-lg text-gray-600">View analytics and trends for instrument parameters</p>
          </div>
          <Button 
            text="View Dashboard"
            icon={<DatabaseOutlined />} 
            onClick={handleViewDashboard}
          />
        </div>

        <Spin spinning={loading}>
          <div className="filter-container grid grid-cols-4 gap-4">
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
          </div>

          <div className="graph-container grid grid-cols-1 gap-24 mt-12">
            <div className="stats-container grid grid-cols-4 gap-4">
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
            </div>

            <div className="line-chart-container rounded-lg w-full h-fit">
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

          <div className="variable-charts-container grid grid-cols-2 gap-6">
            <div className="variable-chart-1 p-4 rounded-lg">
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
            </div>

            <div className="variable-chart-2 p-4 rounded-lg">
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
          </div>

          </div>
          

         
        </Spin>
      </div>
    </div>
  );
}