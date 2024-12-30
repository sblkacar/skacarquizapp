import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Alert } from 'react-bootstrap';
import api from '../../services/api';

function QuizResult() {
  const { resultId } = useParams();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const data = await api.getResults(resultId);
        setResult(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  if (loading) return <div>Loading result...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!result) return <div>Result not found</div>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Quiz Sonucu</Card.Title>
        <div className="result-details">
          <h4>{result.quizTitle}</h4>
          <p>Puan: {result.score}%</p>
          <p>Doğru Sayısı: {result.correctAnswers}</p>
          <p>Toplam Soru: {result.totalQuestions}</p>
          <p>Tamamlanma Tarihi: {new Date(result.completedAt).toLocaleDateString()}</p>
        </div>
      </Card.Body>
    </Card>
  );
}

export default QuizResult; 