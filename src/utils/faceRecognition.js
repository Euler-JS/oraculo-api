// src/utils/faceRecognition.js
const faceapi = require('face-api.js');
const canvas = require('canvas');
const fs = require('fs');
const path = require('path');

// Configurar canvas para face-api.js
const { Canvas, Image, ImageData } = canvas;
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

// Carregar modelos
let modelsLoaded = false;

async function loadModels() {
  if (!modelsLoaded) {
    const modelsPath = path.join(__dirname, '../models');
    
    // Criar diretório se não existir
    if (!fs.existsSync(modelsPath)) {
      fs.mkdirSync(modelsPath, { recursive: true });
    }
    
    // Baixar modelos se não existirem (simplificado - em produção, baixe manualmente)
    const modelFiles = [
      'ssd_mobilenetv1_model-weights_manifest.json',
      'ssd_mobilenetv1_model-shard1',
      'ssd_mobilenetv1_model-shard2',
      'face_landmark_68_model-weights_manifest.json',
      'face_landmark_68_model-shard1',
      'face_landmark_68_tiny_model-weights_manifest.json',
      'face_landmark_68_tiny_model-shard1',
      'face_recognition_model-weights_manifest.json',
      'face_recognition_model-shard1',
      'face_recognition_model-shard2'
    ];
    
    // Nota: Em produção, baixe os modelos de https://github.com/justadudewhohacks/face-api.js/tree/master/weights
    // e coloque em src/models/
    
    try {
      await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
      await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
      await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
      modelsLoaded = true;
      console.log('Modelos de reconhecimento facial carregados');
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      throw error;
    }
  }
}

// Carregar modelos na inicialização
(async () => {
  try {
    await loadModels();
    console.log('Modelos de reconhecimento facial carregados com sucesso');
  } catch (error) {
    console.error('Erro ao carregar modelos:', error);
  }
})();

// Converter buffer de imagem para canvas
function bufferToCanvas(buffer) {
  const img = new Image();
  img.src = buffer;
  const canvasImg = new Canvas(img.width, img.height);
  const ctx = canvasImg.getContext('2d');
  ctx.drawImage(img, 0, 0);
  return canvasImg;
}

// Gerar embedding facial de uma imagem
async function generateFaceEmbedding(imageBuffer) {
  await loadModels();
  
  const canvasImg = bufferToCanvas(imageBuffer);
  const detection = await faceapi.detectSingleFace(canvasImg)
    .withFaceLandmarks()
    .withFaceDescriptor();
  
  if (!detection) {
    throw new Error('Nenhuma face detectada na imagem');
  }
  
  return detection.descriptor; // Array de 128 floats
}

// Comparar dois embeddings (distância euclidiana)
function compareEmbeddings(embedding1, embedding2) {
  if (embedding1.length !== embedding2.length) {
    throw new Error('Embeddings devem ter o mesmo tamanho');
  }
  
  let sum = 0;
  for (let i = 0; i < embedding1.length; i++) {
    sum += Math.pow(embedding1[i] - embedding2[i], 2);
  }
  
  return Math.sqrt(sum);
}

// Encontrar funcionário por embedding facial
async function findEmployeeByFace(imageBuffer, employees) {
  const inputEmbedding = await generateFaceEmbedding(imageBuffer);
  
  let bestMatch = null;
  let bestDistance = Infinity;
  const threshold = 0.6; // Ajustar threshold conforme necessário
  
  for (const employee of employees) {
    if (employee.face_embedding) {
      const storedEmbedding = JSON.parse(employee.face_embedding);
      const distance = compareEmbeddings(inputEmbedding, storedEmbedding);
      
      if (distance < bestDistance && distance < threshold) {
        bestDistance = distance;
        bestMatch = employee;
      }
    }
  }
  
  return bestMatch;
}

module.exports = {
  generateFaceEmbedding,
  findEmployeeByFace,
  loadModels
};