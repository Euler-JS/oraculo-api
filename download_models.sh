#!/bin/bash

# Script para baixar modelos do face-api.js
# Execute: chmod +x download_models.sh && ./download_models.sh

MODELS_DIR="./src/models"

mkdir -p "$MODELS_DIR"

BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

# Modelos necessários
declare -a models=(
    "ssd_mobilenetv1_model-weights_manifest.json"
    "ssd_mobilenetv1_model-shard1"
    "ssd_mobilenetv1_model-shard2"
    "face_landmark_68_model-weights_manifest.json"
    "face_landmark_68_model-shard1"
    "face_landmark_68_tiny_model-weights_manifest.json"
    "face_landmark_68_tiny_model-shard1"
    "face_recognition_model-weights_manifest.json"
    "face_recognition_model-shard1"
    "face_recognition_model-shard2"
)

echo "Baixando modelos do face-api.js..."

for model in "${models[@]}"
do
    echo "Baixando $model..."
    curl -L -o "$MODELS_DIR/$model" "$BASE_URL/$model"
done

echo "Modelos baixados com sucesso!"