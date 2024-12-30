import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Table, Alert, Badge } from 'react-bootstrap';
import api from '../../services/api';

function QuizResults() {
  const { quizId } = useParams();
  const [results, setResults] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizData, resultsData] = await Promise.all([
          api.getQuizById(quizId),
          api.getQuizResults(quizId)
        ]);

        setQuiz(quizData);
        setResults(resultsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [quizId]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;
  if (!quiz) return <div>Quiz bulunamadı</div>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>{quiz.title} - Sonuçlar</Card.Title>
        {results.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>Puan</th>
                <th>Doğru/Toplam</th>
                <th>Tarih</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result._id}>
                  <td>{result.student.name}</td>
                  <td>{result.score}%</td>
                  <td>
                    {result.correctAnswers}/{quiz.questions.length}
                  </td>
                  <td>
                    {new Date(result.completedAt).toLocaleDateString('tr-TR')}
                  </td>
                  <td>
                    <Badge bg={result.score >= 50 ? 'success' : 'danger'}>
                      {result.score >= 50 ? 'Başarılı' : 'Başarısız'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>Bu quiz için henüz sonuç bulunmuyor.</p>
        )}
      </Card.Body>
    </Card>
  );
}

export default QuizResults; 