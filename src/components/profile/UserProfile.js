import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../../services/api';

function UserProfile() {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await api.getCurrentUser();
        setProfile(prev => ({
          ...prev,
          name: data.name,
          email: data.email
        }));
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (profile.newPassword !== profile.confirmPassword) {
      setError('Yeni şifreler eşleşmiyor');
      return;
    }

    try {
      await api.updateUserProfile({
        name: profile.name,
        currentPassword: profile.currentPassword,
        newPassword: profile.newPassword
      });
      
      setSuccess('Profil başarıyla güncellendi');
      setProfile(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div>Loading profile...</div>;

  return (
    <Card>
      <Card.Body>
        <Card.Title>Profil Ayarları</Card.Title>
        {error && <Alert variant="danger">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}
        
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Ad Soyad</Form.Label>
            <Form.Control
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({...profile, name: e.target.value})}
              required
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              value={profile.email}
              disabled
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Mevcut Şifre</Form.Label>
            <Form.Control
              type="password"
              value={profile.currentPassword}
              onChange={(e) => setProfile({...profile, currentPassword: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Yeni Şifre</Form.Label>
            <Form.Control
              type="password"
              value={profile.newPassword}
              onChange={(e) => setProfile({...profile, newPassword: e.target.value})}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Yeni Şifre (Tekrar)</Form.Label>
            <Form.Control
              type="password"
              value={profile.confirmPassword}
              onChange={(e) => setProfile({...profile, confirmPassword: e.target.value})}
            />
          </Form.Group>

          <Button type="submit">
            Kaydet
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
}

export default UserProfile; 