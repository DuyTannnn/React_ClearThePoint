import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css'; // Đảm bảo có import file CSS nếu bạn đã tạo

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);