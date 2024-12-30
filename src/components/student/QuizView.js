import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Button, Form, Alert } from 'react-bootstrap';
import api from '../../services/api';

function QuizView() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await api.getQuizDetails(quizId);
        setQuiz(data);
        // Initialize answers
        const initialAnswers = {};
        data.questions.forEach(q => initialAnswers[q._id] = '');
        setAnswers(initialAnswers);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await api.submitQuizAnswers(quizId, answers);
      navigate(`/student/results/${result._id}`);
    } catch (error) {
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading quiz...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!quiz) return <div>Quiz not found</div>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>{quiz.title}</Card.Title>
        <Form onSubmit={handleSubmit}>
          {quiz.questions.map((question, index) => (
            <Form.Group key={question._id} className="mb-4">
              <Form.Label>
                <strong>{index + 1}. {question.text}</strong>
              </Form.Label>
              {question.options.map((option, optIndex) => (
                <Form.Check
                  key={optIndex}
                  type="radio"
                  id={`${question._id}-${optIndex}`}
                  name={question._id}
                  label={option}
                  value={option}
                  checked={answers[question._id] === option}
                  onChange={(e) => setAnswers({
                    ...answers,
                    [question._id]: e.target.value
                  })}
                  disabled={submitting}
                />
              ))}
            </Form.Group>
          ))}
          <Button 
            type="submit" 
            disabled={submitting}
          >
            {submitting ? 'Gönderiliyor...' : 'Quiz\'i Tamamla'}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default QuizView; 