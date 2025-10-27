-- Adicionar coluna face_embedding à tabela employees
-- Execute este SQL no painel do Supabase (SQL Editor)

ALTER TABLE employees ADD COLUMN face_embedding TEXT;

-- Opcional: adicionar comentário
COMMENT ON COLUMN employees.face_embedding IS 'Embedding facial do funcionário em formato JSON para reconhecimento facial';