'use client';

import Button from "@/components/button";
import DataTable from "@/components/dataTable";
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { BarChartOutlined } from "@ant-design/icons";
import { Segmented } from "antd";
import { useWebSocket } from "@/app/WebSocketContext";
import DashboardSkeleton from "@/components/dashboardSkeleton";
import { apiUrl } from "@/config";
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

    const [pageLoading, setPageLoading] = useState(true);

    const router = useRouter();
    const { liveData, isConnected, connect, disconnect } = useWebSocket();

    useEffect(() => {
        const timer = setTimeout(() => {
            setPageLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    const fetchData = useCallback(async () => {

        if (mode !== "Live") {
            disconnect();
        }

        try {
            setLoading(true);
            let response; 

            if (mode === "Dummy") {
                response = await axios.get(`${apiUrl}/dummy`);
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
            
            const response = await axios.get(`${apiUrl}/historical`, {
                params: {
                    page: pageNum,
                    page_size: 10
                }
            });


            if (pageNum === 1) {
                setData(response.data.data);
            } else {
                setData((prevData) => [...prevData, ...response.data.data]);
            }
            
            setHasMoreData(response.data.has_next);

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

    useEffect(() => {
        let timeout: NodeJS.Timeout;

        const handleScroll = () => {
            if (mode !== "Historical" || isLoadingMore || !hasMoreData) return;

            clearTimeout(timeout);

            timeout = setTimeout(() => {
                const scrollHeight = document.documentElement.scrollHeight;
                const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
                const clientHeight = document.documentElement.clientHeight;
                
                if (scrollHeight - scrollTop - clientHeight < 100) {
                    setIsLoadingMore(true);
                    fetchHistoricalData(currentPage + 1)
                    .then(() => {
                        setCurrentPage(prev => prev + 1);
                    })
                    .finally(() => {
                        setIsLoadingMore(false);
                    });
                }
            }, 100);
        }

        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearTimeout(timeout);
        };
    }, [mode, isLoadingMore, hasMoreData, currentPage, fetchHistoricalData]);
    
    if (pageLoading) {
        return <DashboardSkeleton />;
    }


    return (
        <main className="w-full flex flex-col gap-6">
            <header className="dashboard-header w-full flex flex-col md:flex-row items-start md:items-end gap-4 md:justify-between">
                <header className="dashboard-header-text flex flex-col items-start gap-2">
                    <h1 className="dashboard-title md:my-2">
                        Dashboard
                    </h1>
                    
                    <h2 className="dashboard-subtitle">
                        View and filter instrument parameters for different fridges
                    </h2>

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

                <header className="flex flex-col md:hidden items-start justify-between w-full gap-4">
                    <Button 
                        text="View Analytics"
                        icon={<BarChartOutlined />}
                        onClick={() => {
                            if (mode === "Historical") {
                                localStorage.setItem('historicalData', JSON.stringify(data));
                                console.log("Setting historical data:", data);
                            } 
                            router.push(`/analytics?mode=${mode}`);
                            console.log("Pushing to analytics with mode:", mode);

                        }}
                        label={true}
                        className="w-full md:w-auto"
                    />

                    <Segmented<string>
                        size={window.innerWidth >= 768 ? "large" : "middle"}
                        options={["Dummy", "Live", "Historical"]}
                        onChange={(value) => {
                            setMode(value);
                        }}
                        defaultValue={mode}
                    />
                </header>

                <header className="hidden md:flex flex-row items-end justify-between w-auto gap-4">
                    <Segmented<string>
                        size={window.innerWidth >= 768 ? "large" : "middle"}
                        options={["Dummy", "Live", "Historical"]}
                        onChange={(value) => {
                            setMode(value);
                        }}
                        defaultValue={mode}
                    />

                    <Button 
                        text="View Analytics"
                        icon={<BarChartOutlined />}
                        onClick={() => {
                            if (mode === "Historical") {
                                localStorage.setItem('historicalData', JSON.stringify(data));
                                console.log("Setting historical data:", data);
                            } 
                            router.push(`/analytics?mode=${mode}`);
                            console.log("Pushing to analytics with mode:", mode);

                        }}
                        label={true}
                        className="w-full md:w-auto"
                    />
                </header>
            </header>

            <hr className="divider w-full border-t border-neutral-200" />

            <section className="data-table-container w-full overflow-x-auto">
                <DataTable data={data} loading={loading} />

                {mode === "Historical" && hasMoreData && (
                    <section
                        className="load-more-container flex justify-center my-4">
                        {isLoadingMore ? (
                            <div className="flex justify-center items-center text-accent-500 font-inter">Loading more data...</div>
                            ) : (
                                <div className="flex justify-center items-center text-accent-500 font-inter">Loading more data...</div>
                            )}
                    </section>
                )}
            </section>
        </main>
    );
}