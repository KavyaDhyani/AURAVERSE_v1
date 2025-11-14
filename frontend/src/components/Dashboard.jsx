import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B'];

const Dashboard = () => {
  const [analyticsData, setAnalyticsData] = useState({ pieData: [], barData: [] });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getAnalytics();
        // Assuming the API returns data in the format { pieData: [...], barData: [...] }
        setAnalyticsData(data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };

    fetchAnalytics();
  }, []);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Media Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={analyticsData.pieData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value">
              {analyticsData.pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Upload Volume (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={analyticsData.barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
            <XAxis dataKey="name" stroke="#9CA3AF" />
            <YAxis stroke="#9CA3AF" />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }} />
            <Legend />
            <Bar dataKey="uploads" fill="#8B5CF6" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
