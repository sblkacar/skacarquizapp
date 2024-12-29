import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Navbar from '../../components/common/Navbar';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn()
}));

describe('Navbar Component', () => {
  const mockProps = {
    toggleSidebar: jest.fn(),
    isSidebarOpen: true
  };

  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify({
      name: 'Test User',
      role: 'teacher'
    }));
  });

  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('renders navbar with user info', () => {
    render(
      <BrowserRouter>
        <Navbar {...mockProps} />
      </BrowserRouter>
    );

    expect(screen.getByText('Test User')).toBeInTheDocument();
    expect(screen.getByText('Öğretmen')).toBeInTheDocument();
  });

  test('toggles sidebar when button is clicked', () => {
    render(
      <BrowserRouter>
        <Navbar {...mockProps} />
      </BrowserRouter>
    );

    const toggleButton = screen.getByTestId('sidebar-toggle');
    fireEvent.click(toggleButton);
    expect(mockProps.toggleSidebar).toHaveBeenCalled();
  });
}); 