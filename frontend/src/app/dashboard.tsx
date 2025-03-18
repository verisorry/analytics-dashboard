'use client';

import AnalyticsButton from "@/components/button";
import DataTable from "@/components/dataTable";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BarChartOutlined } from "@ant-design/icons";
import { Button, Segmented } from "antd";
import { useWebSocket } from "@/app/WebSocketContext";
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
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMoreData, setHasMoreData] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const router = useRouter();
    const { liveData, isConnected, connect, disconnect } = useWebSocket();

    const fetchData = useCallback(async () => {

        if (mode !== "Live") {
            disconnect();
        }

        try {
            setLoading(true);
            let response; 

            if (mode === "Dummy") {
                response = await axios.get('http://localhost:8000/dummy');
            } else if (mode === "Live") {
                connect();
                setLoading(false);
                return;
            } else if (mode === "Historical") {
                setCurrentPage(1);
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
    }, [mode, connect, disconnect]);

     const fetchHistoricalData = useCallback(async (pageNum: number) => {
        try {
            if (pageNum === 1) {    
                setLoading(true);
            } else {
                setIsLoadingMore(true);
            }
            
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
                
                setHasMoreData(response.data.has_next);
            } else {
                console.error("Unexpected response structure:", response.data);
                if (pageNum === 1) {
                    setData([]);
                }
                setHasMoreData(false);
            }
        } catch (error) {
            console.error("Error fetching historical data (page:", pageNum, "):", error);
            if (pageNum === 1) {
                setData([]);
            }
            setHasMoreData(false);
        } finally {
            if (pageNum === 1) {
                setLoading(false);
            } else {
                setIsLoadingMore(false);
            }
        }
    }, []);

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

    useEffect(() => {
        if (mode === "Live") {
            setData(liveData);
        }
    }, [mode, liveData]);

    const handleScroll = useCallback(() => {
        if (mode !== "Historical" || isLoadingMore || !hasMoreData) return;
        
        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight = document.documentElement.clientHeight;
        
        // If user has scrolled to the bottom (with a small threshold)
        if (scrollHeight - scrollTop - clientHeight < 200) {
            setIsLoadingMore(true);
            fetchHistoricalData(currentPage + 1)
                .then(() => {
                    setCurrentPage(prev => prev + 1);
                })
                .finally(() => {
                    setIsLoadingMore(false);
                });
        }
    }, [mode, isLoadingMore, hasMoreData, currentPage, fetchHistoricalData]);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, [handleScroll]);
    
    
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
                    {mode === "Live" && (
                    <p className="text-md text-[#3498DB] font-inter">
                        {isConnected ? "Connected: Data updates in real-time every 2 seconds" : "Connecting to live data..."}
                    </p>
                    )}
                </div>

                <div className="flex items-end gap-4">
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

                {mode === "Historical" && hasMoreData && (
                    <div className="load-more-container flex justify-center my-4">
                        {isLoadingMore ? (
                            <div className="flex justify-center items-center">Loading more data...</div>
                        ) : (
                            <Button onClick={() => fetchHistoricalData(currentPage + 1)}>
                                Load More
                            </Button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}