import React from 'react';
import { LayoutDashboard, BarChart2, FileUp, Folder, HardDrive } from 'lucide-react';
import { cn } from '../lib/utils';

const Sidebar = ({ view, setView }) => {
  const navItems = [
    { icon: LayoutDashboard, name: 'Dashboard' },
    { icon: BarChart2, name: 'Analytics' },
  ];

  const stats = [
    { name: 'Total Uploads', value: '1,254' },
    { name: 'Categories', value: '27' },
    { name: 'Storage Used', value: '2.5 GB' },
  ];

  const recentActivity = [
    { icon: FileUp, text: 'Uploaded image.jpg', time: '2m ago' },
    { icon: Folder, text: 'Created category \"Nature\"', time: '1h ago' },
    { icon: HardDrive, text: 'Storage reached 45%', time: '3h ago' },
  ];

  return (
    <aside className="w-[250px] bg-gray-900/70 backdrop-blur-lg border-r border-white/10 p-4 flex flex-col h-screen">
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 to-blue-500 rounded-lg"></div>
        <h1 className="text-xl font-bold text-white">IMSS</h1>
      </div>

      <nav className="flex-1">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</h2>
        <ul>
          {navItems.map((item) => (
            <li key={item.name}>
              <button
                onClick={() => setView(item.name)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  view === item.name
                    ? 'bg-purple-600/20 text-purple-300'
                    : 'text-gray-300 hover:bg-white/10'
                )}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mb-8">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick Stats</h2>
        <div className="space-y-2">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white/5 p-2 rounded-md">
              <p className="text-xs text-gray-400">{stat.name}</p>
              <p className="text-sm font-semibold text-white">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Recent Activity</h2>
        <ul className="space-y-3">
          {recentActivity.map((activity, index) => (
            <li key={index} className="flex items-start gap-3">
              <activity.icon className="w-4 h-4 mt-1 text-gray-500" />
              <div>
                <p className="text-xs text-gray-300">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
