import React from 'react';
import { Link } from 'react-router-dom';
import { Nav } from 'react-bootstrap';
import { FaEye, FaEdit, FaChartBar } from 'react-icons/fa';
import PropTypes from 'prop-types';

function Sidebar({ quizId }) {
  if (!quizId) return null;

  return (
    <Nav className="flex-column">
      <Nav.Link 
        as={Link} 
        to={`/teacher/make-quiz/${quizId}`}
        className="sidebar-link"
      >
        <FaEdit className="me-2" />
        Quiz Düzenle
      </Nav.Link>

      <Nav.Link 
        as={Link} 
        to={`/teacher/dashboard?preview=${quizId}`}
        className="sidebar-link"
      >
        <FaEye className="me-2" />
        Quiz Önizleme
      </Nav.Link>

      <Nav.Link 
        as={Link} 
        to={`/teacher/quiz-results/${quizId}`}
        className="sidebar-link"
      >
        <FaChartBar className="me-2" />
        Sonuçları Görüntüle
      </Nav.Link>
    </Nav>
  );
}

Sidebar.propTypes = {
  quizId: PropTypes.string
};

export default Sidebar; 