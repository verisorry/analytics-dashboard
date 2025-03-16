'use client';

import AnalyticsButton from "@/components/button";
import FilterChip from "@/components/filterChip";
import DataTable from "@/components/dataTable";

import { ClockCircleOutlined, NumberOutlined, FontSizeOutlined, ClearOutlined } from "@ant-design/icons";
import { DatePicker, InputNumber, Select, Space, Button } from "antd";
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
  const [uniqueValues, setUniqueValues] = useState({
    fridgeIds: [] as number[],
    instrumentNames: [] as string[],
    parameterNames: [] as string[],
    valueMin: 0,
    valueMax: 0,
    timestampMin: 0,
    timestampMax: 0
  });
  const [filters, setFilters] = useState({
    fridgeId: null as number | null,
    instrumentName: null as string | null,
    parameterName: null as string | null,
    valueMin: null as number | null,
    valueMax: null as number | null,
    timestampMin: null as number | null,
    timestampMax: null as number | null,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await axios.get('http://localhost:8000/settings');
        const settingsData = response.data.data || [];
        setData(settingsData);
        
        if (settingsData.length > 0) {
          setUniqueValues({
            fridgeIds: [...new Set(settingsData.map((item: SettingData) => item.fridge_id))] as number[],
            instrumentNames: [...new Set(settingsData.map((item: SettingData) => item.instrument_name))] as string[],
            parameterNames: [...new Set(settingsData.map((item: SettingData) => item.parameter_name))] as string[],
            valueMin: Math.min(...settingsData.map((item: SettingData) => item.applied_value)),
            valueMax: Math.max(...settingsData.map((item: SettingData) => item.applied_value)),
            timestampMin: Math.min(...settingsData.map((item: SettingData) => item.timestamp)),
            timestampMax: Math.max(...settingsData.map((item: SettingData) => item.timestamp))
          });
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = data.filter(item => {
    if (filters.fridgeId !== null && item.fridge_id !== filters.fridgeId) {
      return false;
    }
    
    if (filters.instrumentName !== null && item.instrument_name !== filters.instrumentName) {
      return false;
    }
    
    if (filters.parameterName !== null && item.parameter_name !== filters.parameterName) {
      return false;
    }
    
    if (filters.valueMin !== null && item.applied_value < filters.valueMin) {
      return false;
    }
    if (filters.valueMax !== null && item.applied_value > filters.valueMax) {
      return false;
    }
    
    if (filters.timestampMin !== null && item.timestamp < filters.timestampMin) {
      return false;
    }
    if (filters.timestampMax !== null && item.timestamp > filters.timestampMax) {
      return false;
    }
    
    return true;
  });

  const clearAllFilters = () => {
    setFilters({
      fridgeId: null,
      instrumentName: null,
      parameterName: null,
      valueMin: null,
      valueMax: null,
      timestampMin: null,
      timestampMax: null,
    });
  };

  const fridgeIdContent = (
    <div className="p-2 w-64">
      <h4 className="mb-2 font-semibold">Filter by Fridge ID</h4>
      <Select
        placeholder="Select Fridge ID"
        style={{ width: '100%' }}
        options={(uniqueValues.fridgeIds || []).map(id => ({ 
          value: id.toString(), 
          label: `Fridge ${id}` 
        }))}
        loading={loading}
        onChange={(value) => setFilters(prev => ({ 
          ...prev, 
          fridgeId: value ? Number(value) : null 
        }))}
        allowClear
      />
    </div>
  );

  const instrumentNameContent = (
    <div className="p-2 w-64">
      <h4 className="mb-2 font-semibold">Filter by Instrument Name</h4>
      <Select
        placeholder="Select Instrument"
        style={{ width: '100%' }}
        options={(uniqueValues.instrumentNames || []).map(name => ({ 
          value: name, 
          label: name
        }))}
        loading={loading}
        onChange={(value) => setFilters(prev => ({ 
          ...prev, 
          instrumentName: value || null 
        }))}
        allowClear
      />
    </div>
  );

  const parameterNameContent = (
    <div className="p-2 w-64">
      <h4 className="mb-2 font-semibold">Filter by Parameter Name</h4>
      <Select
        placeholder="Select Parameter"
        style={{ width: '100%' }}
        options={(uniqueValues.parameterNames || []).map(name => ({ 
          value: name, 
          label: name
        }))}
        loading={loading}
        onChange={(value) => setFilters(prev => ({ 
          ...prev, 
          parameterName: value || null 
        }))}
        allowClear
      />
    </div>
  );

  const valueContent = (
    <div className="p-2 w-64">
      <h4 className="mb-2 font-semibold">Filter by Value Range</h4>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="flex items-center gap-2">
          <span className="w-10">Min:</span>
          <InputNumber 
            placeholder="Min value" 
            style={{ width: '100%' }} 
            min={uniqueValues.valueMin}
            max={uniqueValues.valueMax}
            defaultValue={uniqueValues.valueMin}
            disabled={loading}
            onChange={(value) => setFilters(prev => ({ 
              ...prev, 
              valueMin: value || null 
            }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10">Max:</span>
          <InputNumber 
            placeholder="Max value" 
            style={{ width: '100%' }} 
            min={uniqueValues.valueMin}
            max={uniqueValues.valueMax}
            defaultValue={uniqueValues.valueMax}
            disabled={loading}
            onChange={(value) => setFilters(prev => ({ 
              ...prev, 
              valueMax: value || null 
            }))}
          />
        </div>
      </Space>
    </div>
  );

  const timestampContent = (
    <div className="p-2 w-64">
      <h4 className="mb-2 font-semibold">Filter by Timestamp Range</h4>
      <Space direction="vertical" style={{ width: '100%' }}>
        <div className="flex items-center gap-2">
          <span className="w-10">From:</span>
          <DatePicker 
            style={{ width: '100%' }} 
            disabled={loading}
            onChange={(date) => setFilters(prev => ({ 
              ...prev, 
              timestampMin: date ? Math.floor(date.valueOf() / 1000) : null 
            }))}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="w-10">To:</span>
          <DatePicker 
            style={{ width: '100%' }} 
            disabled={loading}
            onChange={(date) => setFilters(prev => ({ 
              ...prev, 
              timestampMax: date ? Math.floor(date.valueOf() / 1000) : null 
            }))}
          />
        </div>
      </Space>
    </div>
  );

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

        <div className="filters-container flex justify-between gap-4 w-full">
            <FilterChip 
              placement="bottomLeft" 
              leadingIcon={<NumberOutlined />} 
              label="Fridge ID" 
              content={fridgeIdContent}
              isActive={filters.fridgeId !== null}
              activeValue={filters.fridgeId !== null ? `Fridge ${filters.fridgeId}` : ''}
            />
            <FilterChip 
              placement="bottomLeft" 
              leadingIcon={<FontSizeOutlined />} 
              label="Instrument Name" 
              content={instrumentNameContent}
              isActive={filters.instrumentName !== null}
              activeValue={filters.instrumentName || ''}
            />
            <FilterChip 
              placement="bottomLeft" 
              leadingIcon={<FontSizeOutlined />} 
              label="Parameter Name" 
              content={parameterNameContent}
              isActive={filters.parameterName !== null}
              activeValue={filters.parameterName || ''}
            />
            <FilterChip 
              placement="bottomLeft" 
              leadingIcon={<NumberOutlined />} 
              label="Value" 
              content={valueContent}
              isActive={filters.valueMin !== null || filters.valueMax !== null}
              activeValue={
                filters.valueMin !== null && filters.valueMax !== null
                  ? `${filters.valueMin} - ${filters.valueMax}`
                  : filters.valueMin !== null
                  ? `≥ ${filters.valueMin}`
                  : filters.valueMax !== null
                  ? `≤ ${filters.valueMax}`
                  : ''
              }
            />
            <FilterChip 
              placement="bottomLeft" 
              leadingIcon={<ClockCircleOutlined />} 
              label="Timestamp" 
              content={timestampContent}
              isActive={filters.timestampMin !== null || filters.timestampMax !== null}
              activeValue={
                filters.timestampMin !== null || filters.timestampMax !== null
                  ? 'Date Range'
                  : ''
              }
            />
            
            {(filters.fridgeId !== null || 
              filters.instrumentName !== null || 
              filters.parameterName !== null || 
              filters.valueMin !== null || 
              filters.valueMax !== null || 
              filters.timestampMin !== null || 
              filters.timestampMax !== null) && (
              <Button 
                icon={<ClearOutlined />}
                onClick={clearAllFilters}
                style={{
                  borderRadius: 100,
                  backgroundColor: '#FFF1F0',
                  borderColor: '#FF4D4F',
                  color: '#FF4D4F',
                }}
              >
                Clear Filters
              </Button>
            )}
        </div>
      </div>
      <div className="data-table-container overflow-x-auto">
        <DataTable data={filteredData} loading={loading} />
      </div>
    </div>
  );
}
