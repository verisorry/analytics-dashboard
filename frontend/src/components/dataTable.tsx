import { Table, Button, Space, Slider, DatePicker } from "antd";
import { ClearOutlined, SortAscendingOutlined } from "@ant-design/icons";
import type { ColumnsType, TableProps } from "antd/es/table";
import { useState, useCallback } from "react";

const { RangePicker } = DatePicker;

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

interface CustomFilterDropdownProps {
  setSelectedKeys: (keys: React.Key[]) => void;
  confirm: () => void;
  clearFilters?: () => void;
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

  const valueMin = data.length ? Math.min(...data.map(item => item.applied_value)) : 0;
  const valueMax = data.length ? Math.max(...data.map(item => item.applied_value)) : 100;

  const valueFilterDropdown = useCallback(({ setSelectedKeys, confirm, clearFilters }: CustomFilterDropdownProps) => {
    let currentRange: [number, number] = [valueMin, valueMax];
    
    return (
      <div style={{ padding: 8 }}>
        <Space direction="vertical" style={{ width: 250 }}>
          <p>Value Range: {currentRange[0]} - {currentRange[1]}</p>
          <Slider
            range
            min={valueMin}
            max={valueMax}
            defaultValue={[valueMin, valueMax]}
            onChange={(value) => {
              currentRange = value as [number, number];
            }}
            onAfterChange={(value) => {
              currentRange = value as [number, number];
              document.getElementById('value-range-display')!.textContent = 
                `Value Range: ${currentRange[0]} - ${currentRange[1]}`;
            }}
          />
          <p id="value-range-display">Value Range: {valueMin} - {valueMax}</p>
          <Space>
            <Button
              type="primary"
              onClick={() => {
                setSelectedKeys([`${currentRange[0]}-${currentRange[1]}`]);
                confirm();
              }}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => {
                clearFilters?.();
                currentRange = [valueMin, valueMax];
                document.getElementById('value-range-display')!.textContent = 
                  `Value Range: ${valueMin} - ${valueMax}`;
              }}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </Space>
      </div>
    );
  }, [valueMin, valueMax]);

  const timeFilterDropdown = useCallback(({ setSelectedKeys, confirm, clearFilters }: CustomFilterDropdownProps) => {
    return (
      <div style={{ padding: 8 }}>
        <Space direction="vertical" style={{ width: 300 }}>
          <RangePicker
            showTime
            onChange={(dates) => {
              if (dates && dates[0] && dates[1]) {
                const start = dates[0].unix();
                const end = dates[1].unix();
                setSelectedKeys([`${start}-${end}`]);
              } else {
                setSelectedKeys([]);
              }
            }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => confirm()}
              size="small"
              style={{ width: 90 }}
            >
              Filter
            </Button>
            <Button
              onClick={() => clearFilters?.()}
              size="small"
              style={{ width: 90 }}
            >
              Reset
            </Button>
          </Space>
        </Space>
      </div>
    );
  }, []);

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
      filterDropdown: valueFilterDropdown,
      filteredValue: filteredInfo.applied_value || null,
      onFilter: (value, record) => {
        if (typeof value === 'string') {
          const [min, max] = value.split('-').map(Number);
          return record.applied_value >= min && record.applied_value <= max;
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
      filterDropdown: timeFilterDropdown,
      filteredValue: filteredInfo.timestamp || null,
      onFilter: (value, record) => {
        if (typeof value === 'string') {
          const [min, max] = value.split('-').map(Number);
          return record.timestamp >= min && record.timestamp <= max;
        }
        return true;
      },
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

  const clearSort = () => {
    setSortedInfo({});
  };

  const clearAll = () => {
    setFilteredInfo({});
    setSortedInfo({});
  };

  const hasFilters = Object.values(filteredInfo).some(value => value && value.length > 0);
  const hasSort = sortedInfo.order !== undefined && sortedInfo.columnKey !== undefined;

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space>
          {hasFilters && (
            <Button 
              onClick={clearFilters} 
              icon={<ClearOutlined />}
              style={{
                borderRadius: 100,
                backgroundColor: '#E5EDF3',
                borderColor: '#5A7EA3',
                color: '#5A7EA3',
              }}
            >
              Clear Filters
            </Button>
          )}
          
          {hasSort && (
            <Button 
              onClick={clearSort} 
              icon={<SortAscendingOutlined />}
              style={{
                borderRadius: 100,
                backgroundColor: '#E5EDF3',
                borderColor: '#5A7EA3',
                color: '#5A7EA3',
              }}
            >
              Clear Sort
            </Button>
          )}
          
          {(hasFilters || hasSort) && (
            <Button 
              onClick={clearAll}
              style={{
                borderRadius: 100,
              }}
            >
              Clear All
            </Button>
          )}
        </Space>
      </div>
      <Table 
        dataSource={data} 
        columns={columns} 
        loading={loading}
        rowKey={(record) => `${record.fridge_id}-${record.instrument_name}-${record.timestamp}`}
        onChange={onChange}
        pagination={false}
        bordered
      />
    </div>
  );
}