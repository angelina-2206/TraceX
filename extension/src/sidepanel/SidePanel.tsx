import React from 'react';
import { App } from '../popup/App';

export const SidePanel: React.FC = () => {
  return (
    <div className="w-full min-h-screen bg-[#F8FAFC]">
      <App />
    </div>
  );
};
