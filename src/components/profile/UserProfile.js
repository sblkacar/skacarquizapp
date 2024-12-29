import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Form, Button, Alert, Badge } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaKey, FaUserTag } from 'react-icons/fa';

function UserProfile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5003/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message);
      }

      // Kullanıcı bilgilerini güncelle
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsEditing(false);
      setMessage({ type: 'success', text: 'Profil başarıyla güncellendi' });

    } catch (error) {
      setMessage({ type: 'danger', text: error.message });
    }
  };

  return (
    <Container className="mt-4">
      <Card className="profile-card">
        <Card.Header className="bg-white">
          <h4 className="mb-0">Profil Bilgileri</h4>
        </Card.Header>
        <Card.Body>
          {message && (
            <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
              {message.text}
            </Alert>
          )}

          <Row>
            <Col md={4}>
              <div className="text-center mb-4">
                <div className="profile-avatar">
                  <FaUser size={50} />
                </div>
                <h5 className="mt-3">{user.name}</h5>
                <Badge bg="primary">{user.role === 'admin' ? 'Yönetici' : 
                                   user.role === 'teacher' ? 'Öğretmen' : 
                                   'Öğrenci'}</Badge>
              </div>
            </Col>

            <Col md={8}>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaUser className="me-2" />
                    Ad Soyad
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>
                    <FaEnvelope className="me-2" />
                    E-posta
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                  />
                </Form.Group>

                {isEditing && (
                  <>
                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaKey className="me-2" />
                        Mevcut Şifre
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaKey className="me-2" />
                        Yeni Şifre
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>
                        <FaKey className="me-2" />
                        Yeni Şifre (Tekrar)
                      </Form.Label>
                      <Form.Control
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                      />
                    </Form.Group>
                  </>
                )}

                <div className="d-flex justify-content-end gap-2">
                  {!isEditing ? (
                    <Button 
                      variant="primary" 
                      onClick={() => setIsEditing(true)}
                    >
                      Düzenle
                    </Button>
                  ) : (
                    <>
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => setIsEditing(false)}
                      >
                        İptal
                      </Button>
                      <Button 
                        variant="success" 
                        type="submit"
                      >
                        Kaydet
                      </Button>
                    </>
                  )}
                </div>
              </Form>
            </Col>
          </Row>
        </Card.Body>
      </Card>
    </Container>
  );
}

export default UserProfile; 