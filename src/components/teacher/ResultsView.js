import React, { useState, useEffect } from 'react';
import { Card, Table, Alert, Form, Row, Col, Badge } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts';
import api from '../../services/api';

function ResultsView() {
  const [results, setResults] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('score');
  const [sortDirection, setSortDirection] = useState('desc');
  const [chartData, setChartData] = useState({
    averageScores: [],
    successRate: { success: 0, fail: 0 }
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [quizzesData, resultsData] = await Promise.all([
          api.getTeacherQuizzes(),
          api.getTeacherResults()
        ]);

        setQuizzes(quizzesData);
        setResults(resultsData);
        updateChartData(resultsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateChartData = (resultsData) => {
    if (resultsData.length > 0) {
      // Quiz bazında ortalama puanları hesapla
      const quizScores = {};
      resultsData.forEach(result => {
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
      const successCount = resultsData.filter(r => r.score >= 50).length;
      const failCount = resultsData.length - successCount;

      setChartData({
        averageScores,
        successRate: { success: successCount, fail: failCount }
      });
    }
  };

  // ... Diğer yardımcı fonksiyonlar (handleSort, getSortedResults, vb.) aynı kalacak

  const COLORS = ['#00C49F', '#FF8042'];

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <Alert variant="danger">{error}</Alert>;

  return (
    <div className="results-view">
      {/* Mevcut JSX yapısı aynı kalacak */}
    </div>
  );
}

export default ResultsView; 