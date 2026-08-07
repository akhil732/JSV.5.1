import React from 'react';
import { Printer, HelpCircle } from 'lucide-react';

export const FloatingTools: React.FC = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-center space-y-2 print:hidden">
      <button
        onClick={handlePrint}
        title="Print / Export PDF"
        className="w-10 h-10 rounded-full bg-white text-gray-700 border border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:text-purple-700 transition-all active:scale-95"
      >
        <Printer className="w-4 h-4" />
      </button>

      <button
        title="Help & Software Documentation"
        className="w-10 h-10 rounded-full bg-white text-gray-700 border border-gray-300 shadow-md flex items-center justify-center hover:bg-gray-50 hover:text-purple-700 transition-all active:scale-95"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
    </div>
  );
};
