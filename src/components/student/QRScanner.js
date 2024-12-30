import React, { useState, useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

function QRScanner() {
  const [error, setError] = useState(null);
  const [scanning, setScanning] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      qrbox: {
        width: 250,
        height: 250,
      },
      fps: 5,
    });

    scanner.render(onScanSuccess, onScanError);

    return () => {
      scanner.clear();
    };
  }, []);

  const onScanSuccess = async (decodedText) => {
    try {
      setScanning(false);
      const data = await api.joinQuiz(decodedText);
      
      if (data.quizId) {
        navigate(`/student/quiz/${data.quizId}`);
      }
    } catch (error) {
      setError(error.message);
      setScanning(true);
    }
  };

  const onScanError = (error) => {
    console.warn(error);
  };

  return (
    <div className="qr-scanner-container">
      <h2>QR Kodu Tarayın</h2>
      {error && <div className="error-message">{error}</div>}
      <div id="reader"></div>
      {!scanning && <div>QR Kod okundu, yönlendiriliyorsunuz...</div>}
    </div>
  );
}

export default QRScanner; 