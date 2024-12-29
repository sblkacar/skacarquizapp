import React, { useState, useEffect } from 'react';
import { Container, Card, Table, Badge, Form, Row, Col } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';

function ResultsView() {
  const [results, setResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');

  // Chart verileri için state'ler
  const [chartData, setChartData] = useState({
    averageScores: [],
    successRate: { success: 0, fail: 0 }
  });

  useEffect(() => {
    fetchQuizzes();
    fetchResults();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const response = await fetch('http://localhost:5003/api/quizzes', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Quizler getirilemedi');
      }

      const data = await response.json();
      console.log('Quizler:', data); // Debug log
      setQuizzes(data);
    } catch (error) {
      console.error('Quizleri getirme hatası:', error);
      setError('Quizler yüklenirken bir hata oluştu');
    }
  };

  const fetchResults = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Oturum bulunamadı');
      }

      console.log('Token:', token);
      console.log('Sonuçlar getiriliyor...');

      const response = await fetch('http://localhost:5003/api/results/teacher', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('API yanıtı status:', response.status);
      const data = await response.json();
      console.log('API yanıtı data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Sonuçlar getirilemedi');
      }

      // Veri kontrolü
      if (!Array.isArray(data)) {
        throw new Error('Geçersiz veri formatı');
      }

      // Eksik verileri kontrol et ve düzelt
      const cleanedResults = data.map(result => ({
        ...result,
        student: {
          name: result.student?.name || 'İsimsiz Öğrenci',
          email: result.student?.email || 'E-posta yok'
        },
        quiz: {
          _id: result.quiz?._id,
          title: result.quiz?.title || 'Quiz Bulunamadı'
        },
        score: result.score || 0,
        answers: result.answers || [],
        completedAt: result.completedAt || new Date()
      }));

      setResults(cleanedResults);
    } catch (error) {
      console.error('Sonuçları getirme hatası:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortedResults = () => {
    // Önce filtreleme yap
    let filteredResults = selectedQuiz === 'all'
      ? results
      : results.filter(result => {
          console.log('Filtering:', {
            selectedQuiz,
            resultQuizId: result.quiz?._id,
            match: result.quiz?._id === selectedQuiz
          });
          return result.quiz?._id === selectedQuiz;
        });

    console.log('Filtered results:', filteredResults); // Debug için

    // Sonra sıralama yap
    return filteredResults.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'student':
          comparison = a.student.name.localeCompare(b.student.name);
          break;
        case 'score':
          comparison = a.score - b.score;
          break;
        case 'date':
          comparison = new Date(a.completedAt) - new Date(b.completedAt);
          break;
        default:
          comparison = 0;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const renderSortIcon = (field) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  };

  const handleQuizSelect = (e) => {
    const selectedValue = e.target.value;
    console.log('Selected quiz:', selectedValue); // Debug için
    setSelectedQuiz(selectedValue);
  };

  // Chart verilerini hazırla
  useEffect(() => {
    if (results.length > 0) {
      // Quiz bazında ortalama puanları hesapla
      const quizScores = {};
      results.forEach(result => {
        if (!quizScores[result.quiz.title]) {
          quizScores[result.quiz.title] = {
            scores: [],
            title: result.quiz.title
          };
        }
        quizScores[result.quiz.title].scores.push(result.score);
      });

      const averageScores = Object.values(quizScores).map(quiz => ({
        name: quiz.title,
        average: Math.round(quiz.scores.reduce((a, b) => a + b, 0) / quiz.scores.length)
      }));

      // Başarı/Başarısız oranını hesapla
      const successCount = results.filter(r => r.score >= 50).length;
      const failCount = results.length - successCount;

      setChartData({
        averageScores,
        successRate: {
          success: successCount,
          fail: failCount
        }
      });
    }
  }, [results]);

  const COLORS = ['#00C49F', '#FF8042'];

  const pieData = [
    { name: 'Başarılı', value: chartData.successRate.success },
    { name: 'Başarısız', value: chartData.successRate.fail }
  ];

  if (loading) return <Container className="mt-4">Yükleniyor...</Container>;
  if (error) return <Container className="mt-4"><div className="alert alert-danger">{error}</div></Container>;

  const sortedResults = getSortedResults();

  return (
    <Container className="mt-4">
      <h2 className="mb-4">Quiz Sonuçları</h2>

      <Card className="mb-4">
        <Card.Body>
          <Form.Group>
            <Form.Label>Quiz Seç</Form.Label>
            <Form.Select 
              value={selectedQuiz}
              onChange={handleQuizSelect}
            >
              <option value="all">Tüm Quizler</option>
              {quizzes.map(quiz => {
                console.log('Quiz option:', quiz); // Debug için
                return (
                  <option key={quiz._id} value={quiz._id}>
                    {quiz.title}
                  </option>
                );
              })}
            </Form.Select>
          </Form.Group>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        <Col md={8}>
          <Card>
            <Card.Body>
              <Card.Title>Quiz Ortalama Puanları</Card.Title>
              <div style={{ width: '100%', height: 300 }}>
                <BarChart
                  width={600}
                  height={300}
                  data={chartData.averageScores}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="average" fill="#8884d8" name="Ortalama Puan" />
                </BarChart>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card>
            <Card.Body>
              <Card.Title>Başarı Oranı</Card.Title>
              <div style={{ width: '100%', height: 300 }}>
                <PieChart width={300} height={300}>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {sortedResults.length === 0 ? (
        <Card>
          <Card.Body>
            <Card.Text>Henüz sonuç bulunmuyor.</Card.Text>
          </Card.Body>
        </Card>
      ) : (
        <Card>
          <Card.Body>
            <Table responsive striped>
              <thead>
                <tr>
                  <th 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleSort('student')}
                  >
                    Öğrenci {renderSortIcon('student')}
                  </th>
                  <th>Quiz</th>
                  <th 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleSort('score')}
                  >
                    Puan {renderSortIcon('score')}
                  </th>
                  <th>Doğru/Toplam</th>
                  <th 
                    style={{ cursor: 'pointer' }} 
                    onClick={() => handleSort('date')}
                  >
                    Tarih {renderSortIcon('date')}
                  </th>
                  <th>Durum</th>
                </tr>
              </thead>
              <tbody>
                {sortedResults.map((result) => {
                  const correctCount = (result.answers || []).filter(a => a.isCorrect).length;
                  const totalCount = (result.answers || []).length;
                  
                  return (
                    <tr key={result._id}>
                      <td>{result.student?.name || 'İsimsiz Öğrenci'}</td>
                      <td>{result.quiz?.title || 'Quiz Bulunamadı'}</td>
                      <td>{Math.round(result.score || 0)}%</td>
                      <td>
                        {correctCount}/{totalCount}
                      </td>
                      <td>
                        {new Date(result.completedAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td>
                        <Badge bg={result.score >= 50 ? 'success' : 'danger'}>
                          {result.score >= 50 ? 'Başarılı' : 'Başarısız'}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
}

export default ResultsView; 