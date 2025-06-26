


import React from 'react';

interface CircleButtonProps {
  title: string,
  icon: string,
  _function: any
}

const CircleButton: React.FC<CircleButtonProps> = ({ title, _function, icon}) => (
  <button
    onClick={_function}
    className="w-8 h-8 rounded-full bg-[var(--button-bg)] text-[var(--button-text)] flex items-center justify-center hover:bg-[var(--button-bg-hover)] hover:cursor-pointer"
    title={title}
  >
    {icon}
  </button>
);

export default CircleButton; 