import { Table, Button } from "antd";
import { ClearOutlined } from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import { useState } from "react";

type OnChange = NonNullable<TableProps<SettingData>['onChange']>;

interface SettingData {
  fridge_id: number;
  instrument_name: string;
  parameter_name: string;
  applied_value: number;
  timestamp: number;
}

interface DataTableProps {
  data: SettingData[];
  loading: boolean;
}

export default function DataTable({ 
  data, 
  loading, 
}: DataTableProps) {
  const [filteredInfo, setFilteredInfo] = useState<Record<string, string[]>>({});
  const [sortedInfo, setSortedInfo] = useState<{
    columnKey?: React.Key;
    order?: 'ascend' | 'descend' | null;
  }>({});

  // Generate filter options from data
  const fridgeIdFilters = [...new Set(data.map(item => item.fridge_id))].map(id => ({
    text: `Fridge ${id}`,
    value: id,
  }));
  
  const instrumentNameFilters = [...new Set(data.map(item => item.instrument_name))].map(name => ({
    text: name,
    value: name,
  }));
  
  const parameterNameFilters = [...new Set(data.map(item => item.parameter_name))].map(name => ({
    text: name,
    value: name,
  }));

  // Create value range filters
  const valueMin = data.length ? Math.min(...data.map(item => item.applied_value)) : 0;
  const valueMax = data.length ? Math.max(...data.map(item => item.applied_value)) : 0;
  
  const valueRangeFilters = [
    { text: 'Low', value: 'low' },
    { text: 'Medium', value: 'medium' },
    { text: 'High', value: 'high' },
  ];

  const columns: ColumnsType<SettingData> = [
    {
      title: 'Fridge ID',
      dataIndex: 'fridge_id',
      key: 'fridge_id',
      filters: fridgeIdFilters,
      filteredValue: filteredInfo.fridge_id || null,
      filterSearch: true,
      onFilter: (value, record) => record.fridge_id === value,
      sorter: (a, b) => a.fridge_id - b.fridge_id,
      sortOrder: sortedInfo.columnKey === 'fridge_id' ? sortedInfo.order : null,
    },
    {
      title: 'Instrument Name',
      dataIndex: 'instrument_name',
      key: 'instrument_name',
      filters: instrumentNameFilters,
      filteredValue: filteredInfo.instrument_name || null,
      filterSearch: true,
      onFilter: (value, record) => record.instrument_name === value,
      sorter: (a, b) => a.instrument_name.localeCompare(b.instrument_name),
      sortOrder: sortedInfo.columnKey === 'instrument_name' ? sortedInfo.order : null,
    },
    {
      title: 'Parameter Name',
      dataIndex: 'parameter_name',
      key: 'parameter_name',
      filters: parameterNameFilters,
      filteredValue: filteredInfo.parameter_name || null,
      filterSearch: true,
      onFilter: (value, record) => record.parameter_name === value,
      sorter: (a, b) => a.parameter_name.localeCompare(b.parameter_name),
      sortOrder: sortedInfo.columnKey === 'parameter_name' ? sortedInfo.order : null,
    },
    {
      title: 'Applied Value',
      dataIndex: 'applied_value',
      key: 'applied_value',
      filters: valueRangeFilters,
      filteredValue: filteredInfo.applied_value || null,
      onFilter: (value, record) => {
        if (value === 'low') {
          return record.applied_value <= valueMin + (valueMax - valueMin) / 3;
        }
        if (value === 'medium') {
          const lowerBound = valueMin + (valueMax - valueMin) / 3;
          const upperBound = valueMin + 2 * (valueMax - valueMin) / 3;
          return record.applied_value > lowerBound && record.applied_value <= upperBound;
        }
        if (value === 'high') {
          return record.applied_value > valueMin + 2 * (valueMax - valueMin) / 3;
        }
        return true;
      },
      sorter: (a, b) => a.applied_value - b.applied_value,
      sortOrder: sortedInfo.columnKey === 'applied_value' ? sortedInfo.order : null,
    },
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp) => new Date(timestamp * 1000).toLocaleString(),
      sorter: (a, b) => a.timestamp - b.timestamp,
      sortOrder: sortedInfo.columnKey === 'timestamp' ? sortedInfo.order : null,
    },
  ];

  const onChange: OnChange = (pagination, filters, sorter, extra) => {
    console.log('Table params:', pagination, filters, sorter, extra);
    setFilteredInfo(filters as Record<string, string[]>);
    setSortedInfo(Array.isArray(sorter) ? {} : sorter);
  };

  const clearFilters = () => {
    setFilteredInfo({});
  };

  const hasFilters = Object.values(filteredInfo).some(value => value && value.length > 0);

  return (
    <div>
      {hasFilters && (
        <div style={{ marginBottom: 16 }}>
          <Button 
            onClick={clearFilters} 
            icon={<ClearOutlined />}
            style={{
              borderRadius: 100,
              backgroundColor: '#FFF1F0',
              borderColor: '#FF4D4F',
              color: '#FF4D4F',
              marginRight: 8
            }}
          >
            Clear Filters
          </Button>
        </div>
      )}
      <Table 
        dataSource={data} 
        columns={columns} 
        loading={loading}
        rowKey={(record) => `${record.fridge_id}-${record.instrument_name}-${record.timestamp}`}
        onChange={onChange}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
}