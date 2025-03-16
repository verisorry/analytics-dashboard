'use client';

import { Button, Popover } from 'antd';
import { useState } from 'react';

type Placement = 'top' | 'bottom' | 'left' | 'right' | 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'leftTop' | 'leftBottom' | 'rightTop' | 'rightBottom';

export default function FilterChip({ 
  placement, 
  leadingIcon, 
  label, 
  content,
  isActive = false,
  activeValue = '',
}: { 
  placement: Placement, 
  leadingIcon: React.ReactNode, 
  label: string, 
  content: React.ReactNode,
  isActive?: boolean,
  activeValue?: string,
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover 
      placement={placement} 
      content={content}
      trigger="click"
      arrow={false}
      open={open}
      onOpenChange={setOpen}
    >
      <Button 
        icon={leadingIcon}
        style={{
          borderRadius: 100,
          backgroundColor: isActive ? '#E6F7FF' : undefined,
          borderColor: isActive ? '#1890FF' : '#6386A9',
          color: '#34495E',
        }}
      >
        {isActive && activeValue ? activeValue : label}
      </Button>
    </Popover>
  );
}