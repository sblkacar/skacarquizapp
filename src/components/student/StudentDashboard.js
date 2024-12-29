import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

function StudentDashboard() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);
  const [recentResults, setRecentResults] = useState([]);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchStudentStats();
    fetchRecentResults();
  }, []);

  const fetchStudentStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5003/api/students/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setStats(data);
    } catch (error) {
      console.error('İstatistik getirme hatası:', error);
    }
  };

  const fetchRecentResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5003/api/students/results', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setRecentResults(data);
    } catch (error) {
      console.error('Sonuçları getirme hatası:', error);
    }
  };

  const handleJoinQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Erişim kodunu büyük harfe çevir ve boşlukları kaldır
    const formattedCode = accessCode.trim().toUpperCase();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      // Debug için
      console.log('Sending join request:', { 
        accessCode: formattedCode 
      });

      const response = await fetch('http://localhost:5003/api/quizzes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accessCode: formattedCode })
      });

      const data = await response.json();

      // Debug için
      console.log('Join response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Quiz\'e katılma başarısız');
      }

      // Quiz'e yönlendir
      navigate(`/quiz/${data.quizId}`);

    } catch (error) {
      console.error('Join error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Hoş Geldin, {user?.name}</h2>
      
      <Row className="mt-4">
        <Col md={4}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">İstatistiklerim</h4>
            </Card.Header>
            <Card.Body>
              {stats ? (
                <>
                  <div className="mb-3">
                    <strong>Toplam Quiz:</strong> {stats.totalQuizzes}
                  </div>
                  <div className="mb-3">
                    <strong>Ortalama Başarı:</strong> %{stats.averageScore}
                  </div>
                  <div className="mb-3">
                    <strong>En Yüksek Puan:</strong> %{stats.highestScore}
                  </div>
                  <div className="mb-3">
                    <strong>Başarılı Quiz Sayısı:</strong> {stats.successfulQuizzes}
                  </div>
                  <div className="mb-3">
                    <strong>Toplam Soru:</strong> {stats.totalQuestions}
                  </div>
                  <div className="mb-3">
                    <strong>Doğru Cevap:</strong> {stats.totalCorrectAnswers}
                  </div>
                  {stats.lastQuizDate && (
                    <div>
                      <strong>Son Quiz Tarihi:</strong> {stats.lastQuizDate}
                    </div>
                  )}
                </>
              ) : (
                <div>Henüz quiz sonucunuz bulunmuyor.</div>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h4 className="mb-0">Quiz&apos;e Katıl</h4>
            </Card.Header>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleJoinQuiz}>
                <Form.Group className="mb-3">
                  <Form.Label>Quiz Erişim Kodu</Form.Label>
                  <Form.Control
                    type="text"
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="6 karakterli kod (örn: ABC123)"
                    maxLength={6}
                    pattern="[A-Za-z0-9]{6}"
                    required
                  />
                  <Form.Text className="text-muted">
                    Erişim kodu 6 karakterli ve sadece harf ve rakamlardan oluşmalıdır.
                  </Form.Text>
                </Form.Group>

                <Button 
                  type="submit" 
                  variant="primary"
                  disabled={loading || accessCode.length !== 6}
                >
                  {loading ? 'Kontrol ediliyor...' : 'Quiz\'e Katıl'}
                </Button>
              </Form>
            </Card.Body>
          </Card>

          <Card>
            <Card.Header>
              <h4 className="mb-0">Son Quiz Sonuçlarım</h4>
            </Card.Header>
            <Card.Body>
              {recentResults.length > 0 ? (
                <div className="table-responsive">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Quiz</th>
                        <th>Puan</th>
                        <th>Tarih</th>
                        <th>Durum</th>
                        <th>Doğru Cevap</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentResults.map((result) => (
                        <tr key={result._id}>
                          <td>{result.quiz.title}</td>
                          <td>%{result.score}</td>
                          <td>{new Date(result.completedAt).toLocaleDateString()}</td>
                          <td>
                            <span className={`badge bg-${result.score >= 50 ? 'success' : 'danger'}`}>
                              {result.status}
                            </span>
                          </td>
                          <td>
                            {result.correctAnswers} / {result.quiz.totalQuestions}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p>You haven&apos;t attempted any quizzes yet.</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default StudentDashboard; 