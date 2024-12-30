import React, { useState } from 'react';
import { Form, Button, Container, Row, Col, Card, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const data = await api.login({ email, password });
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        switch (data.user.role) {
          case 'admin':
            navigate('/admin/dashboard');
            break;
          case 'teacher':
            navigate('/teacher/dashboard');
            break;
          case 'student':
            navigate('/student/dashboard');
            break;
          default:
            setError('Geçersiz kullanıcı rolü');
        }
      }
    } catch (error) {
      setError('Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <Container>
        <Row className="justify-content-center">
          <Col md={6}>
            <Card className="auth-card">
              <Card.Body>
                <h2 className="text-center mb-4">Quiz Yönetim Sistemi</h2>
                
                {error && <Alert variant="danger">{error}</Alert>}

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>E-posta</Form.Label>
                    <Form.Control
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="E-posta adresiniz"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Şifre</Form.Label>
                    <Form.Control
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Şifreniz"
                    />
                  </Form.Group>

                  <Button 
                    variant="primary" 
                    type="submit" 
                    className="w-100"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
                  </Button>
                </Form>

                <div className="mt-4">
                  <h5>Test Kullanıcıları:</h5>
                  <small className="text-muted">
                    <p className="mb-1">Admin: admin@test.com / test123</p>
                    <p className="mb-1">Öğretmen: teacher1@test.com / test123</p>
                    <p className="mb-1">Öğrenci: student1@test.com / test123</p>
                  </small>
                </div>

                <div className="text-center mt-3">
                  <Card.Link href="/register">Hesabınız yok mu? Kayıt olun</Card.Link>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default Login; 