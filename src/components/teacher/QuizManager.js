import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Button, Alert } from 'react-bootstrap';
import { FaEdit, FaTrash, FaQrcode, FaToggleOn, FaToggleOff, FaChartBar } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import { useNavigate } from 'react-router-dom';

function QuizManager() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5003/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      setQuizzes(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm('Bu quiz\'i silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5003/api/quizzes/${quizId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      // Quizleri güncelle
      setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));

    } catch (error) {
      setError(error.message);
    }
  };

  const toggleQRCode = (quiz) => {
    setSelectedQuiz(selectedQuiz?._id === quiz._id ? null : quiz);
  };

  const toggleQuizStatus = async (quizId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5003/api/quizzes/${quizId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ isActive: !currentStatus })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message);
      }

      // Quizleri güncelle
      setQuizzes(quizzes.map(quiz => 
        quiz._id === quizId ? { ...quiz, isActive: !quiz.isActive } : quiz
      ));

    } catch (error) {
      setError(error.message);
    }
  };

  const handleViewResults = (quizId) => {
    navigate(`/teacher/quiz-results/${quizId}`);
  };

  if (loading) return <Container className="mt-4">Yükleniyor...</Container>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h4 className="mb-0">Quizlerim</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
          
          {quizzes.length > 0 ? (
            <Table responsive hover>
              <thead>
                <tr>
                  <th>Quiz Adı</th>
                  <th>Erişim Kodu</th>
                  <th>Soru Sayısı</th>
                  <th>Durum</th>
                  <th>İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {quizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td>{quiz.title}</td>
                    <td>
                      <Badge bg="info">{quiz.accessCode}</Badge>
                    </td>
                    <td>{quiz.questions.length}</td>
                    <td>
                      <Badge bg={quiz.isActive ? 'success' : 'danger'}>
                        {quiz.isActive ? 'Aktif' : 'Pasif'}
                      </Badge>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => toggleQRCode(quiz)}
                          title="QR Kod"
                          className="action-button qr-button"
                        >
                          <FaQrcode />
                        </Button>
                        <Button
                          variant={quiz.isActive ? "outline-warning" : "outline-success"}
                          size="sm"
                          onClick={() => toggleQuizStatus(quiz._id, quiz.isActive)}
                          title={quiz.isActive ? "Pasifize Et" : "Aktifleştir"}
                          className={`action-button ${quiz.isActive ? 'toggle-off-button' : 'toggle-on-button'}`}
                        >
                          {quiz.isActive ? <FaToggleOff /> : <FaToggleOn />}
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => navigate(`/teacher/make-quiz/${quiz._id}`)}
                          title="Düzenle"
                          className="action-button edit-button"
                        >
                          <FaEdit />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(quiz._id)}
                          title="Sil"
                          className="action-button delete-button"
                        >
                          <FaTrash />
                        </Button>
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleViewResults(quiz._id)}
                          title="Sonuçlar"
                          className="action-button"
                        >
                          <FaChartBar />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <div className="text-center py-4">
              <p className="mb-0">Henüz quiz oluşturmadınız.</p>
            </div>
          )}
        </Card.Body>
      </Card>

      {selectedQuiz && (
        <Card className="mt-4">
          <Card.Header>
            <h5 className="mb-0">Quiz QR Kodu: {selectedQuiz.title}</h5>
          </Card.Header>
          <Card.Body className="text-center">
            <QRCodeSVG
              value={selectedQuiz.accessCode}
              size={200}
              level="H"
            />
            <p className="mt-3 mb-0">
              Erişim Kodu: <Badge bg="info">{selectedQuiz.accessCode}</Badge>
            </p>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default QuizManager; 