import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3000/api';

export default function Analytics() {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE}/assets`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const assets = json.assets || [];
        // Map asset lastCheck dates into a simple timeline series per status
        const grouped = assets.reduce((acc, asset) => {
          const key = asset.lastCheck || 'Sin fecha';
          if (!acc[key]) acc[key] = { time: key, healthy: 0, warning: 0, critical: 0 };
          if (asset.status === 'Healthy') acc[key].healthy += 1;
          else if (asset.status === 'Warning') acc[key].warning += 1;
          else acc[key].critical += 1;
          return acc;
        }, {});
        const series = Object.values(grouped).sort((a, b) => (a.time > b.time ? 1 : -1));
        setData(series);
      } catch (err) {
        setError(err.message || 'Error al cargar');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h1>Analytics MFE</h1>
      {loading && <p>Cargando...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="healthy" stroke="#22c55e" name="Healthy" />
          <Line type="monotone" dataKey="warning" stroke="#eab308" name="Warning" />
          <Line type="monotone" dataKey="critical" stroke="#ef4444" name="Critical" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
