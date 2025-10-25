// src/routes/departmentRoutes.js
const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');

// Obter todos os departamentos
router.get('/', departmentController.getAllDepartments);

// Obter departamento por ID
router.get('/:id', departmentController.getDepartmentById);

// Criar departamento
router.post('/', departmentController.createDepartment);

// Atualizar departamento
router.put('/:id', departmentController.updateDepartment);

// Excluir departamento
router.delete('/:id', departmentController.deleteDepartment);

module.exports = router;