import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import api from '../../services/api';

function StudentDashboard() {
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, resultsData] = await Promise.all([
          api.getStudentStats(),
          api.getStudentResults()
        ]);

        setStats(statsData);
        setResults(resultsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="dashboard-container">
      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>İstatistikler</Card.Title>
              {stats && (
                <>
                  <p>Tamamlanan Quiz: {stats.completedQuizzes}</p>
                  <p>Ortalama Puan: {stats.averageScore}</p>
                  <p>Başarı Oranı: {stats.successRate}%</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Son Sonuçlar</Card.Title>
              {results.length > 0 ? (
                results.map(result => (
                  <div key={result._id} className="mb-2">
                    <h6>{result.quizTitle}</h6>
                    <p>Puan: {result.score}</p>
                  </div>
                ))
              ) : (
                <p>Henüz quiz sonucu yok</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default StudentDashboard; 