import React, { useState, useEffect } from 'react';
import { Table, Alert, Card } from 'react-bootstrap';
import api from '../../services/api';

function ResultList() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const data = await api.getStudentResults();
        setResults(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <div>Loading results...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Quiz Sonuçlarım</Card.Title>
        {results.length > 0 ? (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Quiz</th>
                <th>Puan</th>
                <th>Tarih</th>
                <th>Durum</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result._id}>
                  <td>{result.quizTitle}</td>
                  <td>{result.score}</td>
                  <td>{new Date(result.completedAt).toLocaleDateString()}</td>
                  <td>{result.passed ? 'Başarılı' : 'Başarısız'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <p>Henüz quiz sonucunuz bulunmamaktadır.</p>
        )}
      </Card.Body>
    </Card>
  );
}

export default ResultList; 