import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function JoinQuiz() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const data = await api.joinQuiz(accessCode.trim());
      navigate(`/student/quiz/${data.quizId}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="join-quiz-container">
      <Card>
        <Card.Body>
          <Card.Title>Quiz'e Katıl</Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Quiz Kodu</Form.Label>
              <Form.Control
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Quiz kodunu girin"
                disabled={loading}
              />
            </Form.Group>
            
            <Button 
              type="submit" 
              disabled={loading || !accessCode.trim()}
            >
              {loading ? 'Katılınıyor...' : 'Katıl'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </div>
  );
}

export default JoinQuiz; 