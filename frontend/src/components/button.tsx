'use client';

import { Button as AntdButton } from "antd";

interface ButtonProps {
  text: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export default function Button({ text, icon, onClick }: ButtonProps) {
  return <AntdButton 
    icon={icon} 
    type="primary" 
    onClick={onClick} 
    style={{
        fontSize: '16px',
        padding: '20px 24px',
        fontFamily: 'var(--font-inter)',
        borderRadius: '8px',
    }}
    >
    {text}
    </AntdButton>;
};