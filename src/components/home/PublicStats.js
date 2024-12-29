import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { FaUsers, FaUserGraduate, FaChalkboardTeacher, FaClipboardCheck } from 'react-icons/fa';

function PublicStats() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStudents: 0,
    totalTeachers: 0,
    totalQuizzes: 0,
    loading: true,
    error: null
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/stats/public');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setStats({
        ...data,
        loading: false,
        error: null
      });
    } catch (error) {
      setStats(prev => ({
        ...prev,
        loading: false,
        error: error.message
      }));
    }
  };

  if (stats.loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <Container className="mt-5">
      <h2 className="text-center mb-5">Quiz Sistemi İstatistikleri</h2>
      <div className="mt-5">
        <Row>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted">Toplam Kullanıcı</h6>
                    <h3>{stats.totalUsers}</h3>
                  </div>
                  <div className="stat-icon-wrapper">
                    <FaUsers className="stat-icon" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted">Öğrenci</h6>
                    <h3>{stats.totalStudents}</h3>
                  </div>
                  <div className="stat-icon-wrapper student-icon">
                    <FaUserGraduate className="stat-icon" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted">Öğretmen</h6>
                    <h3>{stats.totalTeachers}</h3>
                  </div>
                  <div className="stat-icon-wrapper teacher-icon">
                    <FaChalkboardTeacher className="stat-icon" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3} sm={6} className="mb-4">
            <Card className="stat-card h-100">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted">Quiz</h6>
                    <h3>{stats.totalQuizzes}</h3>
                  </div>
                  <div className="stat-icon-wrapper quiz-icon">
                    <FaClipboardCheck className="stat-icon" />
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
      {stats.error && <Alert variant="danger">{stats.error.message}</Alert>}
    </Container>
  );
}

export default PublicStats; 