import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

function QuizView() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { quizId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const response = await fetch(`http://localhost:5003/api/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Quiz bulunamadı');
      }

      const data = await response.json();
      setQuiz(data);
      setAnswers(new Array(data.questions.length).fill(-1));
    } catch (error) {
      setError('Quiz yüklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (answers.includes(-1)) {
      setError('Lütfen tüm soruları cevaplayın');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('Gönderilen cevaplar:', answers);

      const response = await fetch(`http://localhost:5003/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ answers })
      });

      const data = await response.json();
      console.log('API yanıtı:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Quiz gönderilemedi');
      }

      // Sonuç sayfasına yönlendir
      navigate('/student/results', { 
        state: { 
          score: data.score,
          quizTitle: quiz.title,
          result: data.result
        } 
      });

    } catch (error) {
      console.error('Submit hatası:', error);
      setError(error.message || 'Bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <Container className="mt-4">Yükleniyor...</Container>;
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!quiz) {
    return <Container className="mt-4">Quiz bulunamadı</Container>;
  }

  return (
    <Container className="mt-4">
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>{quiz.title}</Card.Title>
          <Card.Text>{quiz.description}</Card.Text>
        </Card.Body>
      </Card>

      <Form onSubmit={handleSubmit}>
        {quiz.questions.map((question, qIndex) => (
          <Card key={qIndex} className="mb-3">
            <Card.Body>
              <Card.Title>Soru {qIndex + 1}</Card.Title>
              <Card.Text>{question.question}</Card.Text>

              {question.options.map((option, oIndex) => (
                <Form.Check
                  key={oIndex}
                  type="radio"
                  id={`q${qIndex}-o${oIndex}`}
                  name={`question-${qIndex}`}
                  label={option}
                  checked={answers[qIndex] === oIndex}
                  onChange={() => {
                    const newAnswers = [...answers];
                    newAnswers[qIndex] = oIndex;
                    setAnswers(newAnswers);
                  }}
                />
              ))}
            </Card.Body>
          </Card>
        ))}

        <Button type="submit" variant="primary">
          Quiz'i Tamamla
        </Button>
      </Form>
    </Container>
  );
}

export default QuizView; 