// src/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Obter todos os funcionários
router.get('/', employeeController.getAllEmployees);

// Obter funcionário por ID
router.get('/:id', employeeController.getEmployeeById);

// Obter funcionário por código interno
router.get('/code/:code', employeeController.getEmployeeByCode);

// Criar funcionário
router.post('/', employeeController.createEmployee);

// Atualizar funcionário
router.put('/:id', employeeController.updateEmployee);

// Excluir funcionário
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;