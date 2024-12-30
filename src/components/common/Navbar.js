import React, { useEffect, useState } from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import './Navbar.css';

function AppNavbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await api.getCurrentUser();
        setUser(data);
      } catch (error) {
        console.error('User fetch error:', error);
      }
    };
    fetchUser();
  }, []);

  const handleLogout = async () => {
    try {
      await api.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <Navbar bg="light" expand="lg">
      <Navbar.Brand as={Link} to="/">Quiz App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="me-auto">
          {user && (
            <>
              <Nav.Link as={Link} to={`/${user.role}/dashboard`}>Dashboard</Nav.Link>
              {user.role === 'teacher' && (
                <Nav.Link as={Link} to="/teacher/quizzes">Quizlerim</Nav.Link>
              )}
              <Nav.Link as={Link} to="/profile">Profil</Nav.Link>
            </>
          )}
        </Nav>
        <Nav>
          {user && (
            <Button variant="outline-primary" onClick={handleLogout}>
              Çıkış Yap
            </Button>
          )}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default AppNavbar; 