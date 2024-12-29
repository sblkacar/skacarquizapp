import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaEye } from 'react-icons/fa';

function ResultList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
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

      setResults(data);
    } catch (error) {
      console.error('Sonuçları getirme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (resultId) => {
    navigate(`/student/results/${resultId}`);
  };

  if (loading) {
    return (
      <Container className="mt-4">
        <div>Yükleniyor...</div>
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h4 className="mb-0">Quiz Sonuçlarım</h4>
        </Card.Header>
        <Card.Body>
          {results.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Puan</th>
                  <th>Doğru/Toplam</th>
                  <th>Tarih</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {results.map((result) => (
                  <tr key={result._id}>
                    <td>{result.quiz.title}</td>
                    <td>%{result.score}</td>
                    <td>
                      {result.correctAnswers} / {result.quiz.totalQuestions}
                    </td>
                    <td>
                      {new Date(result.completedAt).toLocaleDateString('tr-TR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <Badge bg={result.score >= 50 ? 'success' : 'danger'}>
                        {result.status}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => handleViewResult(result._id)}
                        className="d-flex align-items-center gap-2"
                      >
                        <FaEye />
                        Detay
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="mb-0">Henüz bir quiz sonucunuz bulunmuyor.</p>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ResultList; 