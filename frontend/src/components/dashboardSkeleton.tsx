import React from 'react';
import { Skeleton } from 'antd';

const DashboardSkeleton = () => {
  return (
    <main className="dashboard-skeleton flex flex-col gap-12 md:gap-24">
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 items-start md:items-end">
            <section className="col-span-1 md:col-span-2">
                <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
                <Skeleton active paragraph={{ rows: 2 }} title={false} />
            </section>
            <Skeleton.Input active block={true} size={'large'}/>
        </section>
        <section className="grid grid-cols-1 md:gap-6 items-end">
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
            <Skeleton.Input active size="large" block style={{ marginBottom: 8 }} />
        </section>
    </main>
  );
};

export default DashboardSkeleton;