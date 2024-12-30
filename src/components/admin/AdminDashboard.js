import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Button } from 'react-bootstrap';
import api from '../../services/api';

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, teachersData] = await Promise.all([
          api.getUserStats(),
          api.getPendingTeachers()
        ]);

        setStats(statsData);
        setPendingTeachers(teachersData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleApproveTeacher = async (teacherId) => {
    try {
      await api.approveTeacher(teacherId);
      setPendingTeachers(prev => prev.filter(teacher => teacher._id !== teacherId));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading dashboard...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="admin-dashboard">
      <Row>
        <Col md={6}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>Sistem İstatistikleri</Card.Title>
              {stats && (
                <>
                  <p>Toplam Kullanıcı: {stats.totalUsers}</p>
                  <p>Aktif Öğretmen: {stats.activeTeachers}</p>
                  <p>Aktif Öğrenci: {stats.activeStudents}</p>
                  <p>Toplam Quiz: {stats.totalQuizzes}</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Body>
              <Card.Title>Onay Bekleyen Öğretmenler</Card.Title>
              {pendingTeachers.length > 0 ? (
                pendingTeachers.map(teacher => (
                  <div key={teacher._id} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <p className="mb-0">{teacher.name}</p>
                      <small>{teacher.email}</small>
                    </div>
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => handleApproveTeacher(teacher._id)}
                    >
                      Onayla
                    </Button>
                  </div>
                ))
              ) : (
                <p>Onay bekleyen öğretmen yok</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard; 