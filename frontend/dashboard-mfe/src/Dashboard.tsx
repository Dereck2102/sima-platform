import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [data, setData] = useState([
    { name: 'Users', count: 150, active: 120 },
    { name: 'Assets', count: 320, active: 280 },
    { name: 'Devices', count: 45, active: 42 },
    { name: 'Reports', count: 28, active: 25 },
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard MFE</h1>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill="#8884d8" />
          <Bar dataKey="active" fill="#82ca9d" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
