'use client';

import { Button as AntdButton } from "antd";
import { useRouter } from "next/navigation";
import { LineChartOutlined } from "@ant-design/icons";

interface ButtonProps {
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}

function Button({ text, icon, onClick }: ButtonProps) {
  return <AntdButton 
    icon={icon} 
    type="primary" 
    onClick={onClick} 
    style={{
        fontSize: '14px',
        padding: '18px 24px',
        fontFamily: 'var(--font-inter)',
    }}
    >
    {text}
    </AntdButton>;
};

export default function AnalyticsButton() {
    const router = useRouter();

    const handleClick = () => {
        router.push("/analytics");
    }

    return (
        <Button
            text="View Analytics"
            icon={<LineChartOutlined />}
            onClick={handleClick}
            
        />
    )   
}