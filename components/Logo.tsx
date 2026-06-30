import React from 'react';

export const Logo = ({ className = "w-8 h-8" }: { className?: string }) => (
  <svg 
    className={className} 
    viewBox="0 0 1024 1024" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Dark Navy Rounded Background */}
    <rect width="1024" height="1024" rx="220" fill="#020817"/>
    
    {/* White 'P' Shape */}
    <path 
      d="M 320 820 V 300 C 320 180 680 180 680 350 C 680 500 500 580 400 650" 
      stroke="white" 
      strokeWidth="90" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Blue Checkmark */}
    <path 
      d="M 320 680 L 400 780 L 580 580" 
      stroke="#3B82F6" 
      strokeWidth="90" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
    
    {/* Blue Compass Needle */}
    <path 
      d="M 440 450 L 580 350 L 520 530 L 490 460 Z" 
      fill="#3B82F6"
    />
  </svg>
);
