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
          <div className="score-section">
            <h5>Puan: {result.score}%</h5>
            <p>Doğru Cevaplar: {result.correctAnswers} / {result.totalQuestions}</p>
          </div>
          <div className="questions-section">
            {result.questions?.map((question, index) => (
              <div key={index} className="question-item">
                <p><strong>Soru {index + 1}:</strong> {question.text}</p>
                <p>Sizin Cevabınız: {question.userAnswer}</p>
                <p>Doğru Cevap: {question.correctAnswer}</p>
                <p className={question.isCorrect ? 'text-success' : 'text-danger'}>
                  {question.isCorrect ? 'Doğru' : 'Yanlış'}
                </p>
              </div>
            ))}
          </div>
          <p className="completion-date">
            Tamamlanma: {new Date(result.completedAt).toLocaleString('tr-TR')}
          </p>
        </div>
      </Card.Body>
    </Card>
  );
}

export default QuizResult; 