/* eslint-disable react/no-unescaped-entities */
import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';

function TakeQuiz() {
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const { quizId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:5003/api/quizzes/${quizId}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Quiz yüklenemedi');
        }

        setQuiz(data);
        setAnswers(new Array(data.questions.length).fill(null));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [quizId]);

  const handleAnswerChange = (questionIndex, answer) => {
    setAnswers(prev => {
      const newAnswers = [...prev];
      newAnswers[questionIndex] = answer;
      return newAnswers;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Cevapları doğru formatta hazırla
      const formattedAnswers = quiz.questions.map((question, index) => {
        const answer = answers[index];
        
        // Her soru tipi için özel formatlama
        let formattedAnswer;
        switch (question.type) {
          case 'multiple_choice':
            formattedAnswer = {
              questionId: question._id,
              selectedOption: answer, // Seçilen şıkkın indeksi
              type: 'multiple_choice'
            };
            break;
            
          case 'matching':
            formattedAnswer = {
              questionId: question._id,
              pairs: answer || [], // Eşleştirme cevapları dizisi
              type: 'matching'
            };
            break;
            
          case 'fill_blank':
            formattedAnswer = {
              questionId: question._id,
              answers: answer || [], // Boşluk doldurma cevapları dizisi
              type: 'fill_blank'
            };
            break;
            
          default:
            formattedAnswer = {
              questionId: question._id,
              answer: answer,
              type: question.type
            };
        }
        
        return formattedAnswer;
      });

      // Quiz sonuç verilerini hazırla
      const quizSubmission = {
        answers: formattedAnswers,
        completedAt: new Date().toISOString(),
        totalQuestions: quiz.questions.length,
        quizId: quizId,
        studentId: user._id,
        student: {
          id: user._id,
          name: user.name,
          email: user.email
        },
        quizTitle: quiz.title,
        status: 'completed'
      };

      const response = await fetch(`http://localhost:5003/api/quizzes/${quizId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(quizSubmission)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Quiz gönderilemedi');
      }

      setSubmitted(true);
      console.log('Quiz submit response:', data);

      if (data.result && data.result._id) {
        navigate(`/student/results/${data.result._id}`);
      } else {
        console.error('Sonuç ID\'si bulunamadı:', data);
        setError('Sonuç sayfasına yönlendirilemedi');
      }

    } catch (error) {
      console.error('Submit error:', error);
      setError(error.message);
    }
  };

  const renderQuestion = (question, index) => {
    // answers[index] null veya undefined olabilir, bu yüzden varsayılan boş dizi kullanıyoruz
    const currentAnswer = answers[index] || [];
    // parts değişkenini buraya taşıyoruz ve koşullu olarak oluşturuyoruz
    const parts = question.type === 'fill_blank' ? question.text.split('___') : [];
    
    switch (question.type) {
      case 'multiple_choice':
        return (
          <div>
            {question.options.map((option, optionIndex) => (
              <Form.Check
                key={optionIndex}
                type="radio"
                id={`q${index}-o${optionIndex}`}
                name={`question-${index}`}
                label={option}
                checked={answers[index] === optionIndex}
                onChange={() => handleAnswerChange(index, optionIndex)}
              />
            ))}
          </div>
        );

      case 'matching':
        return (
          <div>
            {question.pairs.map((pair, pairIndex) => (
              <Row key={pairIndex} className="mb-2 align-items-center">
                <Col xs={5}>
                  <Card className="p-2">{pair.left}</Card>
                </Col>
                <Col xs={2} className="text-center">
                  <span>→</span>
                </Col>
                <Col xs={5}>
                  <Form.Select
                    value={currentAnswer[pairIndex] ?? ''}
                    onChange={(e) => {
                      const newPairAnswers = [...currentAnswer];
                      newPairAnswers[pairIndex] = e.target.value;
                      handleAnswerChange(index, newPairAnswers);
                    }}
                  >
                    <option value="">Eşleştir...</option>
                    {question.pairs.map((p, i) => (
                      <option key={i} value={i}>
                        {p.right}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
            ))}
          </div>
        );

      case 'fill_blank':
        return (
          <div>
            {parts.map((part, partIndex) => (
              <React.Fragment key={partIndex}>
                <span>{part}</span>
                {partIndex < parts.length - 1 && (
                  <Form.Control
                    type="text"
                    style={{ 
                      width: '150px', 
                      display: 'inline-block',
                      margin: '0 10px'
                    }}
                    value={currentAnswer[partIndex] || ''}
                    onChange={(e) => {
                      const newBlankAnswers = [...currentAnswer];
                      newBlankAnswers[partIndex] = e.target.value;
                      handleAnswerChange(index, newBlankAnswers);
                    }}
                    placeholder="Cevabınızı yazın..."
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        );

      default:
        return <Alert variant="warning">Desteklenmeyen soru tipi</Alert>;
    }
  };

  const isAnswerComplete = (question, answer) => {
    if (!answer) return false;

    switch (question.type) {
      case 'multiple_choice':
        return answer !== null;
      case 'matching':
        return Array.isArray(answer) && 
               answer.length === question.pairs.length && 
               !answer.includes('');
      case 'fill_blank':
        return Array.isArray(answer) && 
               answer.length === question.text.split('___').length - 1 && 
               !answer.includes('');
      default:
        return false;
    }
  };

  const areAllAnswersComplete = () => {
    return quiz.questions.every((question, index) => 
      isAnswerComplete(question, answers[index])
    );
  };

  if (loading) return <Container className="mt-4">Yükleniyor...</Container>;
  if (error) return <Container className="mt-4"><Alert variant="danger">{error}</Alert></Container>;
  if (!quiz) return <Container className="mt-4"><Alert variant="warning">Quiz bulunamadı</Alert></Container>;

  return (
    <Container className="mt-4">
      <Card>
        <Card.Header>
          <h3>{quiz.title}</h3>
          {quiz.description && <p className="mb-0">{quiz.description}</p>}
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {quiz.questions.map((question, index) => (
              <Card key={index} className="mb-3">
                <Card.Body>
                  <Form.Group>
                    <Form.Label>
                      <strong>Soru {index + 1}:</strong> {question.question}
                      <small className="text-muted ms-2">
                        ({question.type === 'multiple_choice' ? 'Çoktan Seçmeli' :
                          question.type === 'matching' ? 'Eşleştirme' :
                          'Boşluk Doldurma'})
                      </small>
                    </Form.Label>
                    {renderQuestion(question, index)}
                  </Form.Group>
                </Card.Body>
              </Card>
            ))}

            <Button 
              type="submit" 
              variant="primary"
              disabled={!areAllAnswersComplete() || submitted}
            >
              Quiz'i Tamamla
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default TakeQuiz; 