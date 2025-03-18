import React from 'react';
import { Skeleton } from 'antd';

const DashboardSkeleton = () => {
  return (
    <div className="dashboard-skeleton flex flex-col gap-24">
        <div className="grid grid-cols-3 gap-12 items-end">
            <div className="col-span-2">
                <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
            </div>
            <Skeleton.Input active block={true} size={'large'}/>
        </div>
        <div>
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
        </div>
    </div>
  );
};

export default DashboardSkeleton;