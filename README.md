# Oraculo API - Sistema de Controle de Ponto com Reconhecimento Facial

API Node.js para controle de ponto de funcionários com suporte a reconhecimento facial gratuito usando bibliotecas open-source.

## Funcionalidades

- ✅ Cadastro e gerenciamento de funcionários
- ✅ Registro de entrada/saída tradicional (por código)
- ✅ **Reconhecimento facial para registro de ponto**
- ✅ Relatórios de presença
- ✅ Configuração de horários de trabalho

## Tecnologias Utilizadas

- **Node.js** + **Express.js**
- **Supabase** (banco de dados)
- **face-api.js** (reconhecimento facial gratuito)
- **TensorFlow.js** (processamento de IA)
- **Canvas** (manipulação de imagens)

## Instalação

1. Clone o repositório
2. Instale as dependências:
   ```bash
   npm install
   ```

3. Baixe os modelos de reconhecimento facial:
   ```bash
   ./download_models.sh
   ```

4. Configure as variáveis de ambiente no arquivo `.env`:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   ```

5. Execute a migração do banco de dados:
   - Abra o painel do Supabase
   - Vá para SQL Editor
   - Execute o conteúdo do arquivo `migration_add_face_embedding.sql`

## Como Usar

### 1. Registrar Funcionário

```bash
POST /api/employees
Content-Type: application/json

{
  "name": "João Silva",
  "position": "Desenvolvedor",
  "department": "TI"
}
```

### 2. Registrar Face do Funcionário

```bash
POST /api/employees/{employee_id}/register-face
Content-Type: multipart/form-data

faceImage: [arquivo de imagem com a face]
```

### 3. Registrar Ponto por Código (Tradicional)

```bash
POST /api/attendance/register
Content-Type: application/json

{
  "employee_code": "AEM123",
  "auth_method": "code",
  "observations": "Entrada normal"
}
```

### 4. Registrar Ponto por Reconhecimento Facial

```bash
POST /api/attendance/register
Content-Type: multipart/form-data

auth_method: face
faceImage: [arquivo de imagem com a face]
observations: Entrada por reconhecimento facial
```

## API Endpoints

### Funcionários
- `GET /api/employees` - Listar todos
- `GET /api/employees/:id` - Buscar por ID
- `POST /api/employees` - Criar funcionário
- `PUT /api/employees/:id` - Atualizar funcionário
- `DELETE /api/employees/:id` - Excluir funcionário
- `POST /api/employees/:id/register-face` - Registrar face

### Controle de Ponto
- `GET /api/attendance` - Listar registros (com filtros)
- `POST /api/attendance/register` - Registrar entrada/saída
- `PUT /api/attendance/:id` - Atualizar registro
- `DELETE /api/attendance/:id` - Excluir registro

## Reconhecimento Facial

O sistema usa face-api.js para:
- Detectar faces em imagens
- Gerar embeddings faciais (vetores de 128 dimensões)
- Comparar faces com threshold de similaridade
- Identificar funcionários automaticamente

### Limitações
- Requer imagem clara da face
- Melhor performance com iluminação adequada
- Threshold configurável (atualmente 0.6)

## Desenvolvimento

```bash
npm run dev  # Com nodemon
npm start    # Produção
```

## Licença

Este projeto usa apenas bibliotecas gratuitas e open-source.