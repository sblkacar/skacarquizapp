import React, { useState, useEffect } from 'react';
import { Card, Alert } from 'react-bootstrap';
import api from '../services/api';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await api.getPublicStats();
        setStats(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Dashboard</Card.Title>
        {stats && (
          <div className="stats-container">
            <p>Toplam Quiz: {stats.totalQuizzes}</p>
            <p>Toplam Kullanıcı: {stats.totalUsers}</p>
            <p>Tamamlanan Quiz: {stats.completedQuizzes}</p>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default Dashboard; 