import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../../services/api';

function MakeQuiz() {
  const { quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState({
    title: '',
    description: '',
    questions: [{ text: '', options: ['', '', '', ''], correctAnswer: 0 }]
  });
  const [loading, setLoading] = useState(!!quizId);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (quizId) {
      fetchQuiz();
    }
  }, [quizId]);

  const fetchQuiz = async () => {
    try {
      const data = await api.getQuizById(quizId);
      setQuiz(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      if (quizId) {
        await api.updateQuiz(quizId, quiz);
      } else {
        await api.createQuiz(quiz);
      }
      navigate('/teacher/quizzes');
    } catch (error) {
      setError(error.message);
    } finally {
      setSaving(false);
    }
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        { text: '', options: ['', '', '', ''], correctAnswer: 0 }
      ]
    });
  };

  const removeQuestion = (index) => {
    const newQuestions = quiz.questions.filter((_, i) => i !== index);
    setQuiz({ ...quiz, questions: newQuestions });
  };

  const updateQuestion = (index, field, value) => {
    const newQuestions = [...quiz.questions];
    if (field === 'text') {
      newQuestions[index].text = value;
    } else if (field.startsWith('option')) {
      const optionIndex = parseInt(field.split('-')[1]);
      newQuestions[index].options[optionIndex] = value;
    } else if (field === 'correctAnswer') {
      newQuestions[index].correctAnswer = parseInt(value);
    }
    setQuiz({ ...quiz, questions: newQuestions });
  };

  if (loading) return <div>Loading quiz...</div>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>{quizId ? 'Quiz Düzenle' : 'Yeni Quiz'}</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Quiz Başlığı</Form.Label>
            <Form.Control
              type="text"
              value={quiz.title}
              onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Açıklama</Form.Label>
            <Form.Control
              as="textarea"
              value={quiz.description}
              onChange={(e) => setQuiz({ ...quiz, description: e.target.value })}
            />
          </Form.Group>

          <h5 className="mt-4">Sorular</h5>
          {quiz.questions.map((question, qIndex) => (
            <Card key={qIndex} className="mb-3">
              <Card.Body>
                <div className="d-flex justify-content-between">
                  <h6>Soru {qIndex + 1}</h6>
                  {quiz.questions.length > 1 && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => removeQuestion(qIndex)}
                    >
                      Soruyu Sil
                    </Button>
                  )}
                </div>

                <Form.Group className="mb-3">
                  <Form.Label>Soru Metni</Form.Label>
                  <Form.Control
                    type="text"
                    value={question.text}
                    onChange={(e) => updateQuestion(qIndex, 'text', e.target.value)}
                    required
                  />
                </Form.Group>

                {question.options.map((option, oIndex) => (
                  <Form.Group key={oIndex} className="mb-2">
                    <Form.Label>Seçenek {oIndex + 1}</Form.Label>
                    <Form.Control
                      type="text"
                      value={option}
                      onChange={(e) => updateQuestion(qIndex, `option-${oIndex}`, e.target.value)}
                      required
                    />
                  </Form.Group>
                ))}

                <Form.Group>
                  <Form.Label>Doğru Cevap</Form.Label>
                  <Form.Select
                    value={question.correctAnswer}
                    onChange={(e) => updateQuestion(qIndex, 'correctAnswer', e.target.value)}
                    required
                  >
                    {question.options.map((_, index) => (
                      <option key={index} value={index}>
                        Seçenek {index + 1}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Card.Body>
            </Card>
          ))}

          <Button 
            variant="secondary" 
            type="button" 
            onClick={addQuestion}
            className="mb-3"
          >
            Soru Ekle
          </Button>

          <div>
            <Button 
              type="submit" 
              disabled={saving}
            >
              {saving ? 'Kaydediliyor...' : (quizId ? 'Güncelle' : 'Oluştur')}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default MakeQuiz; 