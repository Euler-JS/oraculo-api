// src/routes/attendanceRoutes.js
const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const multer = require('multer');

// Configurar multer para upload de imagem facial
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

// Middleware para verificar se é upload facial
const faceUpload = (req, res, next) => {
  if (req.body.auth_method === 'face') {
    // Usar multer para processar o arquivo
    upload.single('faceImage')(req, res, next);
  } else {
    next();
  }
};

// Obter registros de ponto (com filtros)
router.get('/', attendanceController.getAttendance);

// Registrar ponto (entrada ou saída)
router.post('/register', faceUpload, attendanceController.registerAttendance);

// Atualizar registro de ponto
router.put('/:id', attendanceController.updateAttendance);

// Excluir registro de ponto
router.delete('/:id', attendanceController.deleteAttendance);

module.exports = router;