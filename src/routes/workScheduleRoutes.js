// src/routes/workScheduleRoutes.js
const express = require('express');
const router = express.Router();
const workScheduleController = require('../controllers/workScheduleController');

// Obter configuração de horário
router.get('/', workScheduleController.getWorkSchedule);

// Atualizar configuração de horário
router.put('/', workScheduleController.updateWorkSchedule);

module.exports = router;