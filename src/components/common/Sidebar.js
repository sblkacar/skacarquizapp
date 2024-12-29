import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { 
  FaHome, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaClipboardList,
  FaUserCog,
  FaUsers,
  FaPlayCircle,
  FaEye,
  FaGithub,
  FaLinkedin,
  FaEnvelope
} from 'react-icons/fa';

function Sidebar({ isOpen }) {
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user'));

  const getNavItems = () => {
    switch (user?.role) {
      case 'admin':
        return [
          { path: '/admin/dashboard', icon: <FaHome />, text: 'Ana Sayfa' },
          { path: '/admin/users', icon: <FaUsers />, text: 'Kullanıcı Yönetimi' }
        ];
      case 'teacher':
        return [
          { path: '/teacher/dashboard', icon: <FaHome />, text: 'Ana Sayfa' },
          { path: '/teacher/quizzes', icon: <FaClipboardList />, text: 'Quizlerim' },
          { path: '/teacher/make-quiz', icon: <FaChalkboardTeacher />, text: 'Quiz Oluştur' },
          { path: '/teacher/preview', icon: <FaEye />, text: 'Quiz Önizleme' }
        ];
      case 'student':
        return [
          { path: '/student/dashboard', icon: <FaHome />, text: 'Ana Sayfa' },
          { path: '/student/join-quiz', icon: <FaPlayCircle />, text: 'Quiz\'e Katıl' },
          { path: '/student/results', icon: <FaUserGraduate />, text: 'Sonuçlarım' }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <div className={`sidebar ${!isOpen ? 'collapsed' : ''}`}>
      <div className="role-badge">
        <FaUserCog />
        {user?.role === 'admin' ? 'Yönetici' : 
         user?.role === 'teacher' ? 'Öğretmen' : 
         'Öğrenci'}
      </div>
      
      <div className="sidebar-divider" />
      
      <Nav className="flex-column">
        {navItems.map((item, index) => (
          <Nav.Link 
            key={item.path}
            as={Link} 
            to={item.path}
            className={location.pathname === item.path ? 'active' : ''}
            style={{ '--item-index': index }}
          >
            {item.icon}
            {item.text}
          </Nav.Link>
        ))}
      </Nav>

      <div className="sidebar-developer-info">
        <h6 className="developer-title">SİBEL KAÇAR</h6>
        <div className="developer-links">
          <a href="https://github.com/sblkacar" target="_blank" rel="noopener noreferrer">
            <FaGithub /> GitHub
          </a>
          <a href="https://linkedin.com/in/sibel-kaçar" target="_blank" rel="noopener noreferrer">
            <FaLinkedin /> LinkedIn
          </a>
          <a href="mailto:sblkacar81@gmail.com">
            <FaEnvelope /> E-posta
          </a>
        </div>
      </div>
    </div>
  );
}

Sidebar.propTypes = {
  isOpen: PropTypes.bool.isRequired
};

export default Sidebar; 