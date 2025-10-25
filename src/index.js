// src/index.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
require('dotenv').config();

// Rotas (que criaremos em breve)
const employeeRoutes = require('./routes/employeeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const workScheduleRoutes = require('./routes/workScheduleRoutes');
const departmentRoutes = require('./routes/departmentRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(morgan('dev'));

// Rotas
app.use('/api/employees', employeeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/work-schedule', workScheduleRoutes);
app.use('/api/departments', departmentRoutes);

// Rota para verificar se a API está rodando
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API de Controle de Ponto funcionando!' });
});

// Middleware para tratar erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: true,
    message: err.message || 'Ocorreu um erro no servidor',
  });
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});