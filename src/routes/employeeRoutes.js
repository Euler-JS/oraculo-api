// src/routes/employeeRoutes.js
const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const multer = require('multer');

// Configurar multer para upload de imagem
const upload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Apenas arquivos de imagem são permitidos'));
    }
  }
});

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

// Registrar face do funcionário
router.post('/:id/register-face', upload.single('faceImage'), employeeController.registerFace);

module.exports = router;