import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Alert, Badge } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaQrcode, FaToggleOn, FaToggleOff, FaEdit, FaTrash, FaChartBar } from 'react-icons/fa';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../services/api';

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
      const data = await api.getTeacherQuizzes();
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
      await api.deleteQuiz(quizId);
      setQuizzes(quizzes.filter(quiz => quiz._id !== quizId));
    } catch (error) {
      setError(error.message);
    }
  };

  const toggleQRCode = (quiz) => {
    setSelectedQuiz(selectedQuiz?._id === quiz._id ? null : quiz);
  };

  const handleToggleStatus = async (quizId, currentStatus) => {
    try {
      await api.toggleQuizStatus(quizId);
      setQuizzes(quizzes.map(quiz => 
        quiz._id === quizId ? { ...quiz, isActive: !currentStatus } : quiz
      ));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <h4 className="mb-0">Quizlerim</h4>
      </Card.Header>
      <Card.Body>
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
                    <div className="d-flex gap-2">
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => toggleQRCode(quiz)}
                        title="QR Kod"
                      >
                        <FaQrcode />
                      </Button>
                      <Button
                        variant={quiz.isActive ? "outline-warning" : "outline-success"}
                        size="sm"
                        onClick={() => handleToggleStatus(quiz._id, quiz.isActive)}
                        title={quiz.isActive ? "Pasifize Et" : "Aktifleştir"}
                      >
                        {quiz.isActive ? <FaToggleOff /> : <FaToggleOn />}
                      </Button>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/teacher/make-quiz/${quiz._id}`)}
                        title="Düzenle"
                      >
                        <FaEdit />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => handleDelete(quiz._id)}
                        title="Sil"
                      >
                        <FaTrash />
                      </Button>
                      <Button
                        variant="outline-info"
                        size="sm"
                        onClick={() => navigate(`/teacher/quiz-results/${quiz._id}`)}
                        title="Sonuçlar"
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
    </Card>
  );
}

export default QuizManager; 