'use client';

import AnalyticsButton from "@/components/button";
import DataTable from "@/components/dataTable";
import { useState, useEffect } from "react";
import axios from "axios";

interface SettingData {
  fridge_id: number;
  instrument_name: string;
  parameter_name: string;
  applied_value: number;
  timestamp: number;
}

export default function Home() {
  const [data, setData] = useState<SettingData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/settings');
        const settingsData = response.data.data || [];
        setData(settingsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-12 p-6 h-screen">
      <div className="w-auto flex flex-col gap-6">
        <div className="dashboard-header w-full flex items-center justify-between">
          <div className="dashboard-header-text flex flex-col items-start gap-2">
            <h1 className="dashboard-title text-4xl font-bold font-dm-sans">
              Dashboard
            </h1>
            <p className="dashboard-subtitle text-lg font-inter">
              View and filter instrument parameters for different fridges
            </p>
          </div>
          <AnalyticsButton />
        </div>

        <hr className="divider w-full border-t border-neutral-200" />

      </div>
      <div className="data-table-container overflow-x-auto w-full max-w-7xl">
        <DataTable data={data} loading={loading} />
      </div>
    </div>
  );
}
