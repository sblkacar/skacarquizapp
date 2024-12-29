import React, { useState } from 'react';
import { Card, Badge, Button, ListGroup, Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';

function QuizPreview({ quiz }) {
  const [showAnswers, setShowAnswers] = useState(false);

  // Quiz verisinin geçerliliğini kontrol et
  const validateQuiz = (quiz) => {
    if (!quiz || !quiz.questions || !Array.isArray(quiz.questions)) {
      return false;
    }

    // Her sorunun gerekli alanları var mı kontrol et
    return quiz.questions.every(question => {
      if (!question.type || !question.text) return false;

      switch (question.type) {
        case 'multiple_choice':
          return Array.isArray(question.options) && 
                 typeof question.correctOption === 'number';
        
        case 'matching':
          return Array.isArray(question.pairs) && 
                 question.pairs.every(pair => pair.left && pair.right);
        
        case 'fill_blank':
          return Array.isArray(question.blanks) && 
                 question.blanks.every(blank => blank.answer);
        
        default:
          return false;
      }
    });
  };

  const renderQuestionAnswer = (question) => {
    switch (question.type) {
      case 'multiple_choice':
        return (
          <>
            <ListGroup variant="flush">
              {question.options.map((option, idx) => (
                <ListGroup.Item 
                  key={idx}
                  className={showAnswers && idx === question.correctOption ? 'bg-success text-white' : ''}
                >
                  {idx + 1}. {option}
                  {showAnswers && idx === question.correctOption && 
                    <Badge bg="light" text="dark" className="ms-2">✓ Doğru Cevap</Badge>
                  }
                </ListGroup.Item>
              ))}
            </ListGroup>
          </>
        );

      case 'matching': {
        return (
          <ListGroup variant="flush">
            {question.pairs.map((pair, idx) => (
              <ListGroup.Item key={idx} className={showAnswers ? 'bg-success text-white' : ''}>
                <div className="d-flex justify-content-between align-items-center">
                  <span>{pair.left}</span>
                  {showAnswers && <span>→</span>}
                  <span>{showAnswers ? pair.right : '?'}</span>
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        );
      }

      case 'fill_blank': {
        const parts = question.text.split('___');
        return (
          <div>
            {parts.map((part, idx) => (
              <React.Fragment key={idx}>
                <span>{part}</span>
                {idx < parts.length - 1 && (
                  <Badge 
                    bg={showAnswers ? "success" : "secondary"}
                    className="mx-2"
                  >
                    {showAnswers ? question.blanks[idx].answer : '___'}
                  </Badge>
                )}
              </React.Fragment>
            ))}
          </div>
        );
      }

      default:
        return null;
    }
  };

  if (!validateQuiz(quiz)) {
    return (
      <Alert variant="warning">
        <Alert.Heading>Quiz Verisi Hatası</Alert.Heading>
        <p>Quiz verisi eksik veya hatalı format içeriyor.</p>
        <hr />
        <p className="mb-0">
          Lütfen quiz&apos;in tüm gerekli bilgileri içerdiğinden emin olun.
        </p>
      </Alert>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>{quiz.title}</h4>
        <Button
          variant={showAnswers ? "outline-success" : "outline-primary"}
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? "Cevapları Gizle" : "Doğru Cevapları Göster"}
        </Button>
      </div>

      {quiz.questions.map((question, index) => (
        <Card key={index} className="mb-3">
          <Card.Header className="d-flex justify-content-between align-items-center">
            <span>Soru {index + 1}</span>
            <Badge bg="info">{question.type === 'multiple_choice' ? 'Çoktan Seçmeli' : 
                            question.type === 'matching' ? 'Eşleştirme' : 
                            'Boşluk Doldurma'}</Badge>
          </Card.Header>
          <Card.Body>
            <Card.Title>{question.text}</Card.Title>
            {renderQuestionAnswer(question)}
          </Card.Body>
        </Card>
      ))}
    </div>
  );
}

QuizPreview.propTypes = {
  quiz: PropTypes.shape({
    title: PropTypes.string.isRequired,
    questions: PropTypes.arrayOf(PropTypes.shape({
      type: PropTypes.oneOf(['multiple_choice', 'matching', 'fill_blank']).isRequired,
      text: PropTypes.string.isRequired,
      options: PropTypes.arrayOf(PropTypes.string),
      correctOption: PropTypes.number,
      pairs: PropTypes.arrayOf(PropTypes.shape({
        left: PropTypes.string.isRequired,
        right: PropTypes.string.isRequired
      })),
      blanks: PropTypes.arrayOf(PropTypes.shape({
        answer: PropTypes.string.isRequired
      }))
    })).isRequired
  }).isRequired
};

export default QuizPreview; 