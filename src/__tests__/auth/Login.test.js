import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Login from '../../components/auth/Login';

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('Login Component', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          token: 'fake-token',
          role: 'teacher',
          name: 'Test User',
          email: 'test@example.com'
        })
      })
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('successful login redirects to correct dashboard', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('E-posta adresiniz'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Şifreniz'), {
      target: { value: 'password123' }
    });

    fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/teacher/dashboard');
      expect(localStorage.getItem('token')).toBe('fake-token');
    });
  });

  test('shows loading state while logging in', async () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));
    expect(screen.getByText('Giriş yapılıyor...')).toBeInTheDocument();
  });

  test('displays test user credentials', () => {
    render(
      <BrowserRouter>
        <Login />
      </BrowserRouter>
    );

    expect(screen.getByText(/öğretmen: teacher@test.com/i)).toBeInTheDocument();
    expect(screen.getByText(/öğrenci: student@test.com/i)).toBeInTheDocument();
  });
}); 