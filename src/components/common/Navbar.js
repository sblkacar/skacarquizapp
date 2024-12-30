import React from 'react';
import { Navbar, Nav, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './Navbar.css';

function AppNavbar() {
  const navigate = useNavigate();

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
      <Navbar.Brand href="/">Quiz App</Navbar.Brand>
      <Navbar.Toggle aria-controls="basic-navbar-nav" />
      <Navbar.Collapse id="basic-navbar-nav">
        <Nav className="ms-auto">
          <Button variant="outline-primary" onClick={handleLogout}>
            Çıkış Yap
          </Button>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default AppNavbar; 