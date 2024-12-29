import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';

function QRScanner() {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState('');
  const [showScanner, setShowScanner] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let scanner;
    if (showScanner) {
      scanner = new Html5QrcodeScanner('reader', {
        qrbox: {
          width: 250,
          height: 250,
        },
        fps: 5,
      });

      scanner.render(success, error);

      function success(result) {
        scanner.clear();
        setShowScanner(false);
        const quizId = result.split('/').pop();
        if (quizId) {
          joinQuiz(quizId);
        }
      }

      function error(err) {
        if (err?.name === 'NotAllowedError') {
          setError('Kamera erişimi reddedildi. Lütfen kamera izinlerini kontrol edin.');
        } else if (err?.name === 'NotFoundError') {
          setError('Kamera bulunamadı.');
        } else {
          console.warn(err);
        }
      }
    }

    return () => {
      if (scanner) {
        scanner.clear().catch(console.error);
      }
    };
  }, [showScanner]);

  const joinQuiz = async (quizIdOrCode) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://localhost:5003/api/quizzes/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ accessCode: quizIdOrCode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Quiz\'e katılma başarısız');
      }

      navigate(`/student/quiz/${data.quizId}`);
    } catch (error) {
      console.error('Quiz katılma hatası:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (accessCode.trim()) {
      joinQuiz(accessCode.trim());
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>Quiz'e Katıl</Card.Title>
          
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit} className="mb-4">
            <Form.Group className="mb-3">
              <Form.Label>Quiz Kodu</Form.Label>
              <Form.Control
                type="text"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="Quiz kodunu girin"
              />
            </Form.Group>
            <Button 
              type="submit" 
              disabled={loading || !accessCode.trim()}
            >
              {loading ? 'Katılınıyor...' : 'Katıl'}
            </Button>
          </Form>

          <div className="text-center mb-3">
            <Button 
              variant="secondary"
              onClick={() => setShowScanner(prev => !prev)}
            >
              {showScanner ? 'QR Tarayıcıyı Kapat' : 'QR Kod ile Katıl'}
            </Button>
          </div>

          {showScanner && (
            <div style={{ maxWidth: '500px', margin: '0 auto' }}>
              <div id="reader"></div>
              <small className="text-muted d-block text-center mt-2">
                QR kodu kameraya gösterin
              </small>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}

export default QRScanner; 