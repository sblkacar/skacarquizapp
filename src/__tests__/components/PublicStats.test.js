import { render, screen, waitFor, act } from '@testing-library/react';
import PublicStats from '../../components/home/PublicStats';

describe('PublicStats Component', () => {
  const mockStats = {
    totalUsers: 100,
    totalStudents: 80,
    totalTeachers: 20,
    totalQuizzes: 50
  };

  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockStats)
      })
    );
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('renders statistics correctly', async () => {
    await act(async () => {
      render(<PublicStats />);
    });

    await waitFor(() => {
      expect(screen.getByText('100')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('20')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
    });
  });

  test('shows loading state initially', () => {
    render(<PublicStats />);
    expect(screen.getByText('Yükleniyor...')).toBeInTheDocument();
  });

  test('handles error state', async () => {
    const errorMessage = 'API error';
    global.fetch = jest.fn(() =>
      Promise.reject(new Error(errorMessage))
    );

    await act(async () => {
      render(<PublicStats />);
    });

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  test('displays zero values when API fails', async () => {
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('API Error'))
    );

    render(<PublicStats />);

    await waitFor(() => {
      expect(screen.getAllByText('0')).toHaveLength(4);
    });
  });
}); 