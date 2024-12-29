import React from 'react';
import { Container, Card, Button, Row, Col } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';

function QuizResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, quizTitle, result } = location.state || {};

  if (!location.state || score === undefined || !result?.answers) {
    return (
      <Container className="mt-4">
        <Card>
          <Card.Body>
            <Card.Title>Hata</Card.Title>
            <Card.Text>Sonuç bilgisi bulunamadı.</Card.Text>
            <Button onClick={() => navigate('/student/dashboard')}>
              Ana Sayfaya Dön
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Doğru ve yanlış sayılarını hesapla
  const correctCount = result.answers.filter(answer => answer.isCorrect).length;
  const incorrectCount = result.answers.length - correctCount;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body className="text-center">
          <Card.Title className="mb-4">{quizTitle}</Card.Title>
          
          <h2 className="display-4 mb-4">{Math.round(score)}%</h2>
          
          <Row className="justify-content-center mb-4">
            <Col xs={12} md={4}>
              <Card className="text-center mb-3" bg="success" text="white">
                <Card.Body>
                  <h3>{correctCount}</h3>
                  <p className="mb-0">Doğru Cevap</p>
                </Card.Body>
              </Card>
            </Col>
            <Col xs={12} md={4}>
              <Card className="text-center mb-3" bg="danger" text="white">
                <Card.Body>
                  <h3>{incorrectCount}</h3>
                  <p className="mb-0">Yanlış Cevap</p>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card.Text className="mb-4">
            Toplam {result.answers.length} sorudan {correctCount} doğru, {incorrectCount} yanlış cevapladınız.
          </Card.Text>

          <Button 
            variant="primary" 
            size="lg"
            onClick={() => navigate('/student/dashboard')}
          >
            Ana Sayfaya Dön
          </Button>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default QuizResult; 