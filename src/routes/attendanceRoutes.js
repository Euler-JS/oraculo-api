// src/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');

// Obter registros de ponto (com filtros)
router.get('/', attendanceController.getAttendance);

// Registrar ponto (entrada ou saída)
router.post('/register', attendanceController.registerAttendance);

// Atualizar registro de ponto
router.put('/:id', attendanceController.updateAttendance);

// Excluir registro de ponto
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;