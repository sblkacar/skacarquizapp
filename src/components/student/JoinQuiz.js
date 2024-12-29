import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaPlay } from 'react-icons/fa';

function JoinQuiz() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleJoinQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const formattedCode = accessCode.trim().toUpperCase();

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token bulunamadı');
      }

      const response = await fetch('http://localhost:5003/api/quizzes/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ accessCode: formattedCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Quiz\'e katılma başarısız');
      }

      navigate(`/quiz/${data.quizId}`);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card>
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
                className="text-uppercase"
              />
              <Form.Text className="text-muted">
                Erişim kodu 6 karakterli ve sadece harf ve rakamlardan oluşmalıdır.
              </Form.Text>
            </Form.Group>

            <Button 
              type="submit" 
              variant="primary"
              disabled={loading || accessCode.length !== 6}
              className="d-flex align-items-center gap-2"
            >
              <FaPlay />
              {loading ? 'Kontrol ediliyor...' : 'Quiz\'e Katıl'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default JoinQuiz; 