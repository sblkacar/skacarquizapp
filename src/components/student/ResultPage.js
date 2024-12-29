import React, { useState, useEffect } from 'react';
import { Container, Card, Alert, ListGroup, Badge, Row, Col } from 'react-bootstrap';
import { useParams } from 'react-router-dom';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';

// Chart.js bileşenlerini kaydet
ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

function ResultPage() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { resultId } = useParams();

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5003/api/results/${resultId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Sonuçlar yüklenemedi');
        }

        setResult(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [resultId]);

  const renderAnswer = (question, answer, isCorrect) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <>
            <div>Verilen Cevap: {question.options[answer]}</div>
            <div>Doğru Cevap: {question.options[question.correctAnswer]}</div>
          </>
        );

      case 'matching':
        return (
          <div>
            {answer.map((selectedIndex, pairIndex) => (
              <div key={pairIndex}>
                <strong>{question.pairs[pairIndex].left}</strong> → 
                <span className={isCorrect[pairIndex] ? 'text-success' : 'text-danger'}>
                  {question.pairs[selectedIndex].right}
                </span>
                {!isCorrect[pairIndex] && (
                  <span className="text-success ms-2">
                    (Doğru: {question.pairs[pairIndex].right})
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      case 'fill_blank':
        return (
          <div>
            {answer.map((userAnswer, blankIndex) => (
              <div key={blankIndex}>
                Boşluk {blankIndex + 1}: 
                <span className={isCorrect[blankIndex] ? 'text-success' : 'text-danger'}>
                  {userAnswer}
                </span>
                {!isCorrect[blankIndex] && (
                  <span className="text-success ms-2">
                    (Doğru: {question.blanks[blankIndex].answer})
                  </span>
                )}
              </div>
            ))}
          </div>
        );

      default:
        return <div>Bilinmeyen soru tipi</div>;
    }
  };

  const renderCharts = () => {
    if (!result) return null;

    const pieData = {
      labels: ['Doğru', 'Yanlış'],
      datasets: [
        {
          data: [
            result.answers.filter(a => a.isCorrect).length,
            result.answers.filter(a => !a.isCorrect).length
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 99, 132, 0.8)'
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 99, 132, 1)'
          ],
          borderWidth: 1,
        },
      ],
    };

    const questionTypes = {
      multiple_choice: 'Çoktan Seçmeli',
      matching: 'Eşleştirme',
      fill_blank: 'Boşluk Doldurma'
    };

    const typeStats = result.quiz.questions.reduce((acc, q) => {
      const type = questionTypes[q.type];
      if (!acc[type]) {
        acc[type] = {
          total: 0,
          correct: 0
        };
      }
      acc[type].total++;
      if (result.answers[result.quiz.questions.indexOf(q)].isCorrect) {
        acc[type].correct++;
      }
      return acc;
    }, {});

    const barData = {
      labels: Object.keys(typeStats),
      datasets: [
        {
          label: 'Toplam Soru',
          data: Object.values(typeStats).map(s => s.total),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        },
        {
          label: 'Doğru Cevap',
          data: Object.values(typeStats).map(s => s.correct),
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1,
        }
      ],
    };

    return (
      <Row className="mt-4">
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Başarı Oranı</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                <Pie 
                  data={pieData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6}>
          <Card>
            <Card.Header>
              <h5 className="mb-0">Soru Tiplerine Göre Başarı</h5>
            </Card.Header>
            <Card.Body>
              <div style={{ height: '300px', position: 'relative' }}>
                <Bar
                  data={barData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        ticks: {
                          stepSize: 1
                        }
                      }
                    },
                    plugins: {
                      legend: {
                        position: 'bottom'
                      }
                    }
                  }}
                />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  };

  if (loading) return <Container className="mt-4">Yükleniyor...</Container>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!result) return <Container className="mt-4"><Alert variant="warning">Sonuç bulunamadı</Alert></Container>;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h3>Quiz Sonucu</h3>
          <div>
            <Badge bg={result?.score >= 50 ? 'success' : 'danger'} className="me-2">
              Puan: %{Math.round(result?.score)}
            </Badge>
            <small className="text-muted">
              Tamamlanma: {result?.completedAt && new Date(result.completedAt).toLocaleString()}
            </small>
          </div>
        </Card.Header>
        <Card.Body>
          {renderCharts()}
          <ListGroup variant="flush" className="mt-4">
            {result.answers.map((answer, index) => (
              <ListGroup.Item key={index}>
                <h5>Soru {index + 1}</h5>
                <p>{result.quiz.questions[index].question}</p>
                {renderAnswer(
                  result.quiz.questions[index],
                  answer.selectedAnswer,
                  answer.isCorrect
                )}
                <Badge bg={answer.isCorrect ? 'success' : 'danger'} className="mt-2">
                  {answer.isCorrect ? 'Doğru' : 'Yanlış'}
                </Badge>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default ResultPage; 