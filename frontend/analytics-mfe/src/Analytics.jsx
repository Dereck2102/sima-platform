import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function Analytics() {
  const [data] = useState([
    { time: '00:00', requests: 400, errors: 24, latency: 100 },
    { time: '06:00', requests: 520, errors: 16, latency: 95 },
    { time: '12:00', requests: 780, errors: 32, latency: 110 },
    { time: '18:00', requests: 650, errors: 28, latency: 105 },
    { time: '23:59', requests: 420, errors: 12, latency: 90 },
  ]);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Analytics MFE</h1>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="requests" stroke="#8884d8" />
          <Line type="monotone" dataKey="errors" stroke="#ff7300" />
          <Line type="monotone" dataKey="latency" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
