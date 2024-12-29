import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col, Modal } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash } from 'react-icons/fa';
import QuizPreview from './QuizPreview';

function MakeQuiz() {
  const navigate = useNavigate();
  const { quizId } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quiz, setQuiz] = useState({
    title: '',
    type: 'multiple_choice',
    questions: [{ 
      text: '', 
      type: 'multiple_choice',
      options: ['', '', '', ''], 
      correctOption: 0,
      matches: [],
      answer: ''
    }]
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewQuiz, setPreviewQuiz] = useState(null);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5003/api/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Backend\'den gelen ham veri:', data);

      if (!response.ok) {
        throw new Error(data.message);
      }

      const formattedQuiz = {
        ...data,
        type: data.type || 'multiple_choice',
        questions: data.questions.map(q => {
          console.log('İşlenen soru:', q);
          const questionType = q.type || data.type || 'multiple_choice';
          const formattedQuestion = {
            ...q,
            type: questionType,
            options: questionType === 'multiple_choice' ? (q.options || ['', '', '', '']) : [],
            matches: questionType === 'matching' ? (q.matches || []) : [],
            answer: questionType === 'fill_in_blank' ? (q.answer || '') : '',
            correctOption: questionType === 'multiple_choice' ? (typeof q.correctOption === 'number' ? q.correctOption : 0) : undefined
          };
          console.log('Formatlanmış soru:', formattedQuestion);
          return formattedQuestion;
        })
      };

      console.log('Son formatlanmış quiz:', formattedQuiz);
      setQuiz(formattedQuiz);
    } catch (error) {
      console.error('Quiz yükleme hatası:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const url = quizId 
        ? `http://localhost:5003/api/quizzes/${quizId}`
        : 'http://localhost:5003/api/quizzes';
      
      const method = quizId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quiz)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      navigate('/teacher/quizzes');
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quiz.questions];
    if (field === 'text') {
      updatedQuestions[index].text = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.replace('option', ''));
      updatedQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctOption') {
      updatedQuestions[index].correctOption = parseInt(value);
    } else if (field === 'answer') {
      updatedQuestions[index].answer = value;
    } else if (field.startsWith('match')) {
      const [matchIndex, part] = field.replace('match', '').split('_');
      const matchIdx = parseInt(matchIndex);
      
      if (!updatedQuestions[index].matches) {
        updatedQuestions[index].matches = [];
      }
      
      if (!updatedQuestions[index].matches[matchIdx]) {
        updatedQuestions[index].matches[matchIdx] = { left: '', right: '' };
      }
      
      updatedQuestions[index].matches[matchIdx][part] = value;
      
      updatedQuestions[index].matches = updatedQuestions[index].matches.filter(
        match => match && (match.left.trim() !== '' || match.right.trim() !== '')
      );
    }
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleQuizTypeChange = (newType) => {
    setQuiz({
      ...quiz,
      type: newType,
      questions: quiz.questions.map(q => ({
        ...q,
        type: newType,
        options: newType === 'multiple_choice' ? ['', '', '', ''] : [],
        matches: newType === 'matching' ? [] : [],
        answer: newType === 'fill_in_blank' ? '' : '',
        correctOption: newType === 'multiple_choice' ? 0 : undefined
      }))
    });
  };

  const addQuestion = () => {
    const newQuestion = {
      text: '',
      type: quiz.type,
      options: quiz.type === 'multiple_choice' ? ['', '', '', ''] : [],
      matches: quiz.type === 'matching' ? [] : [],
      answer: quiz.type === 'fill_in_blank' ? '' : '',
      correctOption: quiz.type === 'multiple_choice' ? 0 : undefined
    };
    setQuiz({
      ...quiz,
      questions: [...quiz.questions, newQuestion]
    });
  };

  const addMatch = (questionIndex) => {
    const updatedQuestions = [...quiz.questions];
    if (!updatedQuestions[questionIndex].matches) {
      updatedQuestions[questionIndex].matches = [];
    }
    updatedQuestions[questionIndex].matches = [
      ...updatedQuestions[questionIndex].matches,
      { left: '', right: '' }
    ];
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const removeMatch = (questionIndex, matchIndex) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[questionIndex].matches = updatedQuestions[questionIndex].matches.filter(
      (_, idx) => idx !== matchIndex
    );
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const removeQuestion = (index) => {
    if (quiz.questions.length > 1) {
      const updatedQuestions = quiz.questions.filter((_, i) => i !== index);
      setQuiz({ ...quiz, questions: updatedQuestions });
    }
  };

  const renderQuestionFields = (question, questionIndex) => {
    console.log(`Soru ${questionIndex + 1} render ediliyor:`, {
      type: question.type,
      text: question.text,
      options: question.options,
      matches: question.matches,
      answer: question.answer
    });

    switch (question.type) {
      case 'multiple_choice':
        return (
          <Row>
            {(question.options || []).map((option, optionIndex) => (
              <Col md={6} key={optionIndex} className="mb-3">
                <Form.Group>
                  <Form.Label>
                    Seçenek {optionIndex + 1}
                    <Form.Check
                      inline
                      type="radio"
                      name={`correct-${questionIndex}`}
                      checked={question.correctOption === optionIndex}
                      onChange={() => handleQuestionChange(questionIndex, 'correctOption', optionIndex)}
                      className="ms-2"
                    />
                  </Form.Label>
                  <Form.Control
                    type="text"
                    value={option || ''}
                    onChange={(e) => handleQuestionChange(questionIndex, `option${optionIndex}`, e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
            ))}
          </Row>
        );

      case 'matching':
        return (
          <div>
            {(question.matches || []).map((match, matchIndex) => (
              <Row key={matchIndex} className="mb-3 align-items-center">
                <Col md={5}>
                  <Form.Control
                    type="text"
                    placeholder="Sol eşleştirme"
                    value={match?.left || ''}
                    onChange={(e) => handleQuestionChange(questionIndex, `match${matchIndex}_left`, e.target.value)}
                    required
                  />
                </Col>
                <Col md={1} className="text-center">
                  <span>⟷</span>
                </Col>
                <Col md={5}>
                  <Form.Control
                    type="text"
                    placeholder="Sağ eşleştirme"
                    value={match?.right || ''}
                    onChange={(e) => handleQuestionChange(questionIndex, `match${matchIndex}_right`, e.target.value)}
                    required
                  />
                </Col>
                <Col md={1}>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => removeMatch(questionIndex, matchIndex)}
                    title="Eşleştirmeyi Sil"
                  >
                    <FaTrash />
                  </Button>
                </Col>
              </Row>
            ))}
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={() => addMatch(questionIndex)}
              className="mt-2"
            >
              <FaPlus className="me-2" />
              Eşleştirme Ekle
            </Button>
          </div>
        );

      case 'fill_in_blank':
        return (
          <Form.Group>
            <Form.Label>Doğru Cevap</Form.Label>
            <Form.Control
              type="text"
              value={question.answer || ''}
              onChange={(e) => handleQuestionChange(questionIndex, 'answer', e.target.value)}
              required
            />
          </Form.Group>
        );

      default:
        console.log('Bilinmeyen soru tipi:', question.type);
        return null;
    }
  };

  const handlePreview = async (quizId) => {
    try {
      const response = await fetch(`http://localhost:5003/api/quizzes/${quizId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Quiz bulunamadı');
      }

      const quiz = await response.json();
      setPreviewQuiz(quiz);
      setShowPreview(true);
    } catch (error) {
      console.error('Quiz önizleme hatası:', error);
      // Hata durumunda kullanıcıya bilgi verebilirsiniz
    }
  };

  if (loading) return <Container className="mt-4">Yükleniyor...</Container>;

  return (
    <Container className="py-4">
      <Card>
        <Card.Header>
          <h4 className="mb-0">{quizId ? 'Quiz Düzenle' : 'Yeni Quiz Oluştur'}</h4>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Row className="mb-4">
              <Col md={8}>
                <Form.Group>
                  <Form.Label>Quiz Başlığı</Form.Label>
                  <Form.Control
                    type="text"
                    value={quiz.title}
                    onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Quiz Tipi</Form.Label>
                  <Form.Select
                    value={quiz.type}
                    onChange={(e) => handleQuizTypeChange(e.target.value)}
                    disabled={quizId}
                  >
                    <option value="multiple_choice">Çoktan Seçmeli</option>
                    <option value="matching">Eşleştirme</option>
                    <option value="fill_in_blank">Boşluk Doldurma</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {quiz.questions.map((question, questionIndex) => (
              <Card key={questionIndex} className="mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="mb-0">Soru {questionIndex + 1}</h5>
                    {quiz.questions.length > 1 && (
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeQuestion(questionIndex)}
                      >
                        <FaTrash />
                      </Button>
                    )}
                  </div>

                  <Form.Group className="mb-3">
                    <Form.Label>Soru Metni</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={question.text}
                      onChange={(e) => handleQuestionChange(questionIndex, 'text', e.target.value)}
                      required
                    />
                  </Form.Group>

                  {renderQuestionFields(question, questionIndex)}
                </Card.Body>
              </Card>
            ))}

            <Button 
              variant="outline-primary" 
              onClick={addQuestion} 
              className="mb-4 w-100"
            >
              <FaPlus className="me-2" />
              Yeni Soru Ekle
            </Button>
            
            <div className="d-flex justify-content-end gap-2">
              <Button 
                variant="secondary" 
                onClick={() => navigate('/teacher/quizzes')}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                variant="primary"
                disabled={loading}
              >
                {quizId ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Quiz Önizleme Modalı */}
      <Modal
        show={showPreview}
        onHide={() => {
          setShowPreview(false);
          setPreviewQuiz(null);
        }}
        size="lg"
        centered
        dialogClassName="preview-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            {previewQuiz?.title} - Önizleme
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {previewQuiz ? (
            <QuizPreview quiz={previewQuiz} />
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

export default MakeQuiz; 