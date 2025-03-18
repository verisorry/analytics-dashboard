'use client';

import { Button as AntdButton } from "antd";

interface ButtonProps {
    text: string;
    icon: React.ReactNode;
    onClick: () => void;
    label: boolean;
    className?: string;
}

export default function Button({ text, icon, onClick, label, className }: ButtonProps) {
  return <AntdButton 
    icon={icon} 
    type="primary" 
    onClick={onClick} 
    className={className}
    style={{
        fontSize: '16px',
        padding: '20px 24px',
        fontFamily: 'var(--font-inter)',
        borderRadius: '8px',
    }}
    >
    {label ? text : null}
    </AntdButton>;
};