import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Alert } from 'react-bootstrap';
import { FaUserGraduate, FaChalkboardTeacher, FaUserClock, FaUserCheck } from 'react-icons/fa';

function AdminDashboard() {
  const [pendingTeachers, setPendingTeachers] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    pendingTeachers: 0,
    approvedTeachers: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingTeachers();
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await fetch('http://localhost:5003/api/admin/user-stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'İstatistikler getirilemedi');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('İstatistik hatası:', error);
      setError(error.message);
    }
  };

  const fetchPendingTeachers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await fetch('http://localhost:5003/api/admin/pending-teachers', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Veriler getirilemedi');
      }

      const data = await response.json();
      setPendingTeachers(data);
      setError(null);
    } catch (error) {
      console.error('Veri getirme hatası:', error);
      setError(error.message || 'Veriler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (teacherId, status) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await fetch(`http://localhost:5003/api/admin/teacher-approval/${teacherId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'İşlem başarısız');
      }

      // Listeyi güncelle
      await fetchPendingTeachers();
      setError(null);
    } catch (error) {
      console.error('Onaylama hatası:', error);
      setError(error.message || 'İşlem sırasında bir hata oluştu');
    }
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container fluid className="mt-4">
      <h2 className="mb-4">Yönetici Paneli</h2>

      {/* İstatistik Kartları */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Toplam Öğrenci</h6>
                  <h3>{stats.totalStudents}</h3>
                </div>
                <FaUserGraduate className="stat-icon text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Toplam Öğretmen</h6>
                  <h3>{stats.totalTeachers}</h3>
                </div>
                <FaChalkboardTeacher className="stat-icon text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Bekleyen Başvuru</h6>
                  <h3>{stats.pendingTeachers}</h3>
                </div>
                <FaUserClock className="stat-icon text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Onaylı Öğretmen</h6>
                  <h3>{stats.approvedTeachers}</h3>
                </div>
                <FaUserCheck className="stat-icon text-info" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Bekleyen Başvurular Tablosu */}
      <Card>
        <Card.Header>
          <h4 className="mb-0">Bekleyen Öğretmen Başvuruları</h4>
        </Card.Header>
        <Card.Body>
          {error && (
            <Alert variant="danger" className="mt-3">
              {error}
            </Alert>
          )}
          
          {!error && pendingTeachers.length === 0 ? (
            <Alert variant="info">
              Bekleyen başvuru bulunmuyor.
            </Alert>
          ) : (
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>Ad Soyad</th>
                  <th>Email</th>
                  <th>Kayıt Tarihi</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {pendingTeachers.map((teacher) => (
                  <tr key={teacher._id}>
                    <td>{teacher.name}</td>
                    <td>{teacher.email}</td>
                    <td>{new Date(teacher.createdAt).toLocaleDateString('tr-TR')}</td>
                    <td>
                      <Badge bg="warning">Beklemede</Badge>
                    </td>
                    <td>
                      <Button
                        variant="success"
                        size="sm"
                        className="me-2"
                        onClick={() => handleApproval(teacher._id, 'approved')}
                      >
                        Onayla
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleApproval(teacher._id, 'rejected')}
                      >
                        Reddet
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default AdminDashboard; 