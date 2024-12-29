import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Alert, Row, Col, Button, Modal } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

function QuizResults() {
  const { quizId } = useParams();
  const [results, setResults] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAnswers, setShowAnswers] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);

  useEffect(() => {
    fetchResults();
  }, [quizId]);

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5003/api/quizzes/${quizId}/results`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Debug için detaylı log
      console.log('Quiz results data:', {
        quiz: data.quiz,
        results: data.results,
        stats: data.stats,
        firstResult: data.results[0]
      });
      
      if (!data.quiz || !data.results) {
        throw new Error('Eksik veri alındı');
      }

      setQuiz(data.quiz);
      setResults(data.results);
      setStats(data.stats);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleShowAnswers = (result) => {
    // Debug için
    console.log('Selected result:', result);
    setSelectedResult(result);
    setShowAnswers(true);
  };

  const renderAnswer = (answer) => {
    switch (answer.questionType) {
      case 'multiple_choice':
        return (
          <div>
            <p>Seçilen: {quiz.questions[answer.questionIndex].options[answer.selectedAnswer]}</p>
            <p className="text-success">
              Doğru: {quiz.questions[answer.questionIndex].options[answer.correctAnswer]}
            </p>
          </div>
        );

      case 'matching':
        return (
          <div>
            {answer.selectedAnswer.map((selected, idx) => (
              <div key={idx} className="mb-2">
                <p>
                  {quiz.questions[answer.questionIndex].pairs[idx].left} →{' '}
                  {quiz.questions[answer.questionIndex].pairs[selected]?.right}
                </p>
                <p className="text-success">
                  Doğru: {quiz.questions[answer.questionIndex].pairs[idx].left} →{' '}
                  {quiz.questions[answer.questionIndex].pairs[idx].right}
                </p>
              </div>
            ))}
          </div>
        );

      case 'fill_blank':
        return (
          <div>
            {answer.selectedAnswer.map((selected, idx) => (
              <div key={idx} className="mb-2">
                <p>Girilen: {selected}</p>
                <p className="text-success">
                  Doğru: {quiz.questions[answer.questionIndex].blanks[idx].answer}
                </p>
              </div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) return <Container className="mt-4">Yükleniyor...</Container>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h4 className="mb-0">{quiz?.title} - Sonuçlar</h4>
        </Card.Header>
        <Card.Body>
          <Row className="mb-4">
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h6>Toplam Katılımcı</h6>
                  <h3 className="text-primary">{stats?.totalParticipants}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h6>Ortalama Başarı</h6>
                  <h3 className="text-success">%{stats?.averageScore}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="text-center h-100">
                <Card.Body>
                  <h6>Toplam Deneme</h6>
                  <h3 className="text-info">{stats?.totalAttempts}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Table responsive striped hover>
            <thead>
              <tr>
                <th>Öğrenci</th>
                <th>E-posta</th>
                <th>Puan</th>
                <th>Doğru</th>
                <th>Yanlış</th>
                <th>Tarih</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {results.map(result => (
                <tr key={result._id}>
                  <td>{result.student.name}</td>
                  <td>{result.student.email}</td>
                  <td>
                    <Badge bg={result.score >= 50 ? "success" : "danger"}>
                      %{Math.round(result.score)}
                    </Badge>
                  </td>
                  <td className="text-success">
                    {result.correctCount || 0}
                  </td>
                  <td className="text-danger">
                    {result.wrongCount || result.totalQuestions - result.correctCount || 0}
                  </td>
                  <td>
                    {new Date(result.completedAt).toLocaleString('tr-TR')}
                  </td>
                  <td>
                    <Button 
                      variant="outline-info" 
                      size="sm"
                      onClick={() => handleShowAnswers(result)}
                    >
                      Cevapları Göster
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Modal
        show={showAnswers}
        onHide={() => setShowAnswers(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedResult?.student?.name || 'Öğrenci'} - Cevap Detayları
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedResult && quiz ? (
            selectedResult.answers?.map((answer, index) => (
              <Card key={index} className="mb-3">
                <Card.Header className="d-flex justify-content-between align-items-center">
                  <strong>Soru {index + 1}</strong>
                  <Badge 
                    bg={answer.isCorrect ? "success" : "danger"} 
                    className="ms-2"
                  >
                    {answer.isCorrect ? "Doğru" : "Yanlış"}
                  </Badge>
                </Card.Header>
                <Card.Body>
                  <p className="mb-3">
                    <strong>Soru: </strong>
                    {quiz.questions[answer.questionIndex]?.text}
                  </p>
                  {quiz.questions[answer.questionIndex] && renderAnswer(answer)}
                </Card.Body>
              </Card>
            ))
          ) : (
            <Alert variant="info">
              Sonuç detayları yüklenemedi. Lütfen tekrar deneyin.
            </Alert>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowAnswers(false);
            setSelectedResult(null);
          }}>
            Kapat
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

export default QuizResults; 