import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaEdit, FaChartBar, FaQrcode, FaUsers, FaEye } from 'react-icons/fa';
import QuizPreview from './QuizPreview';

function TeacherDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [stats, setStats] = useState({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalParticipants: 0,
    averageScore: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const teacherName = localStorage.getItem('userName')?.trim() || 'Öğretmen';
  const [showPreview, setShowPreview] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);

  // URL'den preview parametresini kontrol et
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const previewQuizId = params.get('preview');

  // Quizleri ve preview durumunu kontrol et
  useEffect(() => {
    fetchQuizzes();
    fetchStats();
  }, []);

  // Preview parametresi değiştiğinde quiz'i bul ve modalı aç
  useEffect(() => {
    const loadPreviewQuiz = async () => {
      if (previewQuizId) {
        try {
          setLoading(true);
          setError(null);
          
          const response = await fetch(`http://localhost:5003/api/quizzes/${previewQuizId}`, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });

          if (!response.ok) {
            throw new Error('Quiz bulunamadı');
          }

          const quiz = await response.json();
          console.log('Yüklenen quiz verisi:', quiz);

          // Quiz verisinin doğru formatta olduğunu kontrol et
          if (!quiz.title || !Array.isArray(quiz.questions)) {
            throw new Error('Geçersiz quiz verisi');
          }

          setSelectedQuiz(quiz);
          setShowPreview(true);
        } catch (error) {
          console.error('Quiz yükleme hatası:', error);
          setError(error.message);
          setSelectedQuiz(null);
        } finally {
          setLoading(false);
        }
      }
    };

    loadPreviewQuiz();
  }, [previewQuizId]);

  // Modal kapatma işleyicisi
  const handleClosePreview = () => {
    setShowPreview(false);
    setSelectedQuiz(null);
    // URL'den preview parametresini kaldır
    navigate('/teacher/dashboard', { replace: true });
  };

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Quizler getirilemedi');
      }

      const data = await response.json();
      setQuizzes(data);
    } catch (error) {
      setError('Quizler yüklenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/quizzes/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('İstatistikler getirilemedi');
      }

      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('İstatistik hatası:', error);
    }
  };

  const handlePreview = (quiz) => {
    try {
      if (!quiz || !quiz.questions) {
        throw new Error('Quiz verisi eksik');
      }

      // Quiz tipine göre soruları formatlayalım
      const formattedQuiz = {
        ...quiz,
        questions: quiz.questions.map(q => {
          const baseQuestion = {
            text: q.text,
            type: q.type || quiz.type
          };

          switch (q.type || quiz.type) {
            case 'multiple_choice':
              return {
                ...baseQuestion,
                options: q.options || [],
                correctOption: q.correctOption
              };

            case 'matching':
              return {
                ...baseQuestion,
                pairs: q.pairs || []
              };

            case 'fill_blank':
              return {
                ...baseQuestion,
                blanks: q.blanks || []
              };

            default:
              return baseQuestion;
          }
        })
      };

      setSelectedQuiz(formattedQuiz);
      setShowPreview(true);
    } catch (error) {
      console.error('Quiz önizleme hatası:', error);
      setError('Quiz önizlenirken bir hata oluştu');
    }
  };

  if (loading) return <Container>Yükleniyor...</Container>;
  if (error) return <Container>{error}</Container>;

  return (
    <Container className="mt-4">
      <div className="dashboard-header mb-4 p-4 bg-white rounded shadow-sm">
        <h2>Hoş Geldin, {teacherName}</h2>
        <p className="text-muted mb-0">Quiz yönetim paneline hoş geldiniz</p>
      </div>

      {/* İstatistikler */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Toplam Quiz</h6>
                  <h3 className="text-center">{stats.totalQuizzes}</h3>
                </div>
                <FaEdit className="stat-icon text-primary" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Aktif Quiz</h6>
                  <h3 className="text-center">{stats.activeQuizzes}</h3>
                </div>
                <FaQrcode className="stat-icon text-success" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted">Toplam Katılımcı</h6>
                  <h3 className="text-center" >{stats.totalParticipants}</h3>
                </div>
                <FaUsers className="stat-icon text-info" />
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={3}>
          <Card className="stat-card">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="text-muted ">Ortalama Başarı</h6>
                  <h3 className="text-center">
                    {stats.averageScore ? (
                      `%${stats.averageScore}`
                    ) : (
                      '0'
                    )}
                  </h3>
                </div>
                <FaChartBar className="stat-icon text-warning" />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Quizler */}
      <h4 className="mb-3">Quizlerim</h4>
      <Row>
        {quizzes.map(quiz => (
          <Col key={quiz._id} md={4} className="mb-4">
            <Card className="h-100 quiz-card">
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <Card.Title>{quiz.title}</Card.Title>
                  <Badge bg={quiz.isActive ? 'success' : 'danger'}>
                    {quiz.isActive ? 'Aktif' : 'Pasif'}
                  </Badge>
                </div>
                <div className="quiz-stats mb-3 text-center">
                  <small className="text-muted">
                    <div className="mb-1">
                      <strong>Soru Sayısı:</strong> {quiz.questions.length}
                    </div>
                    <div>
                      <strong>Katılımcı:</strong> {quiz.participantCount || 0}
                    </div>
                  </small>
                </div>
                <div className="d-flex flex-wrap gap-4 justify-content-center">
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => handlePreview(quiz)}
                    className="preview-button"
                  >
                    <FaEye className="me-1" />
                  </Button>
                  <Button 
                    variant="outline-primary" 
                    size="sm"
                    onClick={() => navigate(`/teacher/make-quiz/${quiz._id}`)}
                  >
                    <FaEdit className="me-1" />
                  </Button>
                  <Button 
                    variant="outline-info" 
                    size="sm"
                    onClick={() => navigate(`/teacher/quiz-results/${quiz._id}`)}
                  >
                    <FaChartBar className="me-1" />
                  </Button>
                </div>
              </Card.Body>
              <Card.Footer className="text-muted">
                <small>
                  Oluşturulma: {new Date(quiz.createdAt).toLocaleDateString('tr-TR')}
                </small>
              </Card.Footer>
            </Card>
          </Col>
        ))}

        {/* Boş durum mesajı */}
        {quizzes.length === 0 && (
          <Col xs={12}>
            <Card className="text-center p-5">
              <Card.Body>
                <h5>Henüz quiz oluşturmadınız</h5>
                <p>Yeni bir quiz oluşturmak için aşağıdaki butona tıklayın</p>
                <Button 
                  variant="primary"
                  onClick={() => navigate('/teacher/make-quiz')}
                >
                  Quiz Oluştur
                </Button>
              </Card.Body>
            </Card>
          </Col>
        )}
      </Row>

      {/* Quiz Önizleme Modalı */}
      <Modal
        show={showPreview}
        onHide={() => {
          setShowPreview(false);
          setSelectedQuiz(null);
          setError(null);
        }}
        size="lg"
        centered
        dialogClassName="preview-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedQuiz?.title} - Önizleme
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error ? (
            <Alert variant="danger">{error}</Alert>
          ) : selectedQuiz ? (
            <QuizPreview quiz={selectedQuiz} />
          ) : (
            <div className="text-center">
              <span className="spinner-border spinner-border-sm me-2" />
              Yükleniyor...
            </div>
          )}
        </Modal.Body>
      </Modal>

      <style>
        {`
          .quiz-card {
            transition: transform 0.2s;
          }
          .quiz-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 4px 15px rgba(0,0,0,0.1);
          }
          .quiz-stats {
            border-left: 3px solid #007bff;
            padding-left: 10px;
          }
          .preview-button:hover {
            background-color: #17a2b8;
            color: white;
          }
          .preview-modal {
            max-width: 800px;
          }
          .preview-modal .modal-body {
            max-height: 70vh;
            overflow-y: auto;
          }
        `}
      </style>
    </Container>
  );
}

export default TeacherDashboard; 