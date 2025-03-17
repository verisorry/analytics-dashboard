'use client';

import AnalyticsButton from "@/components/button";
import DataTable from "@/components/dataTable";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BarChartOutlined } from "@ant-design/icons";
import { Segmented } from "antd";

interface SettingData {
  fridge_id: number;
  instrument_name: string;
  parameter_name: string;
  applied_value: number;
  timestamp: number;
}

export default function Dashboard() {
    const [mode, setMode] = useState<string>("Dummy");
    const [data, setData] = useState<SettingData[]>([]);
    const [loading, setLoading] = useState(true);

    const [hasInitialised, setHasInitialised] = useState(false);
    const router = useRouter();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            let response; 

            if (mode === "Dummy") {
                response = await axios.get('http://localhost:8000/dummy');
            } else if (mode === "Live") {
                response = await axios.get('http://localhost:8000/live');
            } else if (mode === "Historical") {
                await fetchHistoricalData(1);
                return;
            }
            console.log("API response:", response?.data);
            setData(response?.data?.data || []);
        } catch (error) {
            console.error(`Error fetching ${mode} data:`, error);
        } finally {
            setLoading(false);
        }
    }, [mode]);

     const fetchHistoricalData = async (pageNum: number) => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:8000/historical', {
                params: {
                    page: pageNum,
                    page_size: 10
                }
            });

            if (response.data && response.data.data) {
                if (pageNum === 1) {
                    setData(response.data.data);
                } else {
                    setData((prevData) => [...prevData, ...response.data.data]);
                }
            } else {
                console.error("Unexpected response structure:", response.data);
                if (pageNum === 1) {
                    setData([]);
                }
            }

            setLoading(false);
        } catch (error) {
            console.error("Error fetching historical data (page:", pageNum, "):", error);
            if (pageNum === 1) {
                setData([]);
            }
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!hasInitialised) {
            const savedMode = localStorage.getItem('mode');
            if (savedMode) {
                setMode(savedMode);
            }
            fetchData();
            localStorage.setItem('mode', mode);
            setHasInitialised(true);
        } else {
            fetchData();
        }
    }, [mode, hasInitialised, fetchData]);

    return (
        <div className="w-full flex flex-col gap-6">
            <div className="dashboard-header w-full flex items-end justify-between">
                <div className="dashboard-header-text flex flex-col items-start gap-2">
                <h1 className="dashboard-title text-5xl font-bold font-dm-sans">
                    Dashboard
                </h1>
                <p className="dashboard-subtitle text-lg font-inter">
                    View and filter instrument parameters for different fridges
                </p>
                </div>

                <div className="flex items-end gap-2">
                    <Segmented<string>
                        size="large"
                        options={["Dummy", "Live", "Historical"]}
                        onChange={(value) => {
                            setMode(value);
                        }}
                        defaultValue={mode}
                        
                    />
                    <AnalyticsButton 
                        text="View Analytics"
                        icon={<BarChartOutlined />}
                        onClick={() => {
                            localStorage.setItem('mode', mode);
                            router.push("/analytics")
                        }}
                    />
                </div>
            </div>

            <hr className="divider w-full border-t border-neutral-200" />

            <div className="data-table-container w-full overflow-x-auto">
                <DataTable data={data} loading={loading} />
            </div>
        </div>
    );
}