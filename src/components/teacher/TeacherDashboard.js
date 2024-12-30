import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Alert, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function TeacherDashboard() {
  const [stats, setStats] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, quizzesData] = await Promise.all([
          api.getTeacherStats(),
          api.getTeacherQuizzes()
        ]);

        setStats(statsData);
        setQuizzes(quizzesData);
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
    <div className="teacher-dashboard">
      <Row>
        <Col md={4}>
          <Card className="mb-3">
            <Card.Body>
              <Card.Title>İstatistikler</Card.Title>
              {stats && (
                <>
                  <p>Toplam Quiz: {stats.totalQuizzes}</p>
                  <p>Aktif Quiz: {stats.activeQuizzes}</p>
                  <p>Toplam Katılım: {stats.totalParticipants}</p>
                  <p>Ortalama Başarı: {stats.averageSuccess}%</p>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={8}>
          <Card>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <Card.Title>Son Quizler</Card.Title>
                <Button onClick={() => navigate('/teacher/quiz/new')}>
                  Yeni Quiz
                </Button>
              </div>
              {quizzes.length > 0 ? (
                quizzes.slice(0, 5).map(quiz => (
                  <div key={quiz._id} className="d-flex justify-content-between align-items-center mb-2">
                    <div>
                      <h6>{quiz.title}</h6>
                      <small>{quiz.questions.length} Soru</small>
                    </div>
                    <Button 
                      variant="outline-primary"
                      size="sm"
                      onClick={() => navigate(`/teacher/quiz/${quiz._id}`)}
                    >
                      Detay
                    </Button>
                  </div>
                ))
              ) : (
                <p>Henüz quiz oluşturmadınız</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

export default TeacherDashboard; 