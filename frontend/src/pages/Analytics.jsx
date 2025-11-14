import React from 'react';
import Dashboard from '../components/Dashboard';
import { File, Folder, Database, HardDrive } from 'lucide-react';

const stats = [
  { icon: File, name: 'Total Files', value: '1,254' },
  { icon: Folder, name: 'Categories', value: '27' },
  { icon: Database, name: 'JSON Schemas', value: '12' },
  { icon: HardDrive, name: 'Storage Used', value: '2.5 GB' },
];

const Analytics = () => {
  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6 flex items-center gap-4">
            <div className="p-3 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg">
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-400">{stat.name}</p>
              <p className="text-2xl font-semibold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      <Dashboard />
    </div>
  );
};

export default Analytics;
