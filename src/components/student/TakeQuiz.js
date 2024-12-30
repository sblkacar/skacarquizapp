import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Form, Card, Alert } from 'react-bootstrap';
import api from '../../services/api';

function TakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const data = await api.getQuizDetails(quizId);
        setQuiz(data);
        // Initialize answers object
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
    <div className="quiz-container">
      {/* Quiz render logic */}
    </div>
  );
}

export default TakeQuiz; 