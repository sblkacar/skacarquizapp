import React from 'react';
import { Navbar as BootstrapNavbar, Container, Button } from 'react-bootstrap';
import { FaBars, FaSignOutAlt, FaGraduationCap, FaUser } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

function Navbar({ toggleSidebar, isSidebarOpen }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const getUserRole = (role) => {
    switch(role) {
      case 'admin':
        return 'Yönetici';
      case 'teacher':
        return 'Öğretmen';
      case 'student':
        return 'Öğrenci';
      default:
        return '';
    }
  };

  return (
    <BootstrapNavbar className="main-navbar">
      <Container fluid className="px-3">
        <div className="d-flex align-items-center">
          <Button
            className="sidebar-toggle"
            data-testid="sidebar-toggle"
            variant="link"
            onClick={toggleSidebar}
            style={{ 
              width: '40px', 
              height: '40px',
              padding: 0,
              color: '#1e293b'
            }}
          >
            <FaBars size={20} />
          </Button>
          <BootstrapNavbar.Brand className="d-flex align-items-center">
            <FaGraduationCap className="me-2" size={24} />
            Quiz App
          </BootstrapNavbar.Brand>
        </div>
        
        <div className="d-flex align-items-center gap-3">
          <div className="user-info d-none d-md-flex">
            <Button
              variant="link"
              className="p-0 text-dark"
              onClick={() => navigate('/profile')}
            >
              <FaUser className="me-2" />
              {user?.name}
            </Button>
            <span className="user-role">
              {getUserRole(user?.role)}
            </span>
          </div>
          <Button
            variant="link"
            onClick={handleLogout}
            className="logout-button"
          >
            <FaSignOutAlt />
            Çıkış
          </Button>
        </div>
      </Container>
    </BootstrapNavbar>
  );
}

Navbar.propTypes = {
  toggleSidebar: PropTypes.func.isRequired,
  isSidebarOpen: PropTypes.bool.isRequired
};

export default Navbar; 