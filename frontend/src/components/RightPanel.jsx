import React from 'react';
import { Cpu, HardDrive, Zap, FileText, Image as ImageIcon } from 'lucide-react';

const RightPanel = () => {
  const queue = [
    { name: 'image_01.jpg', progress: 75 },
    { name: 'user_data.json', progress: 40 },
  ];

  const systemStatus = [
    { icon: Cpu, name: 'AI', status: 'Ready', color: 'text-green-400' },
    { icon: HardDrive, name: 'Storage', status: '45% used', color: 'text-yellow-400' },
    { icon: Zap, name: 'Queue', status: '2 pending', color: 'text-orange-400' },
  ];

  const liveActivity = [
    { icon: ImageIcon, text: 'AI tagged "sunset.jpg"', time: '5s ago' },
    { icon: FileText, text: 'Imported 50 records from "sales.json"', time: '12s ago' },
  ];

  return (
    <aside className="w-[300px] bg-gray-900/70 backdrop-blur-lg border-l border-white/10 p-4 flex flex-col h-screen">
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Processing Queue</h3>
        <div className="space-y-4">
          {queue.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-300 truncate">{item.name}</span>
                <span className="text-gray-400">{item.progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-1.5">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-1.5 rounded-full" style={{ width: `${item.progress}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">System Status</h3>
        <ul className="space-y-3">
          {systemStatus.map((item, index) => (
            <li key={index} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-300">
                <item.icon className={`w-4 h-4 ${item.color}`} />
                <span>{item.name}</span>
              </div>
              <span className={`font-medium ${item.color}`}>{item.status}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-white mb-4">Live Activity</h3>
        <ul className="space-y-4">
          {liveActivity.map((activity, index) => (
            <li key={index} className="flex items-start gap-3 animate-fade-in">
              <div className="bg-white/10 p-1.5 rounded-full">
                <activity.icon className="w-4 h-4 text-gray-300" />
              </div>
              <div>
                <p className="text-xs text-gray-200">{activity.text}</p>
                <p className="text-xs text-gray-500">{activity.time}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default RightPanel;
