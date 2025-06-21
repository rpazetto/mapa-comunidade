-- Script para criar as tabelas de mídia no banco de dados
USE community_mapper;

-- Tabela para armazenar metadados dos arquivos de mídia
CREATE TABLE IF NOT EXISTS person_media (
  id INT PRIMARY KEY AUTO_INCREMENT,
  person_id INT NOT NULL,
  user_id INT NOT NULL,
  type ENUM('audio', 'video', 'mindmap', 'document', 'image', 'meeting') NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  file_url VARCHAR(500),
  file_size VARCHAR(50),
  duration VARCHAR(50),
  date DATE NOT NULL,
  location VARCHAR(255),
  is_private BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE,
  transcript TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_person_media (person_id),
  INDEX idx_type (type),
  INDEX idx_date (date)
);

-- Tabela para tags de mídia
CREATE TABLE IF NOT EXISTS media_tags (
  id INT PRIMARY KEY AUTO_INCREMENT,
  media_id INT NOT NULL,
  tag VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (media_id) REFERENCES person_media(id) ON DELETE CASCADE,
  INDEX idx_media_tags (media_id),
  INDEX idx_tag (tag)
);

-- Tabela para participantes de reuniões
CREATE TABLE IF NOT EXISTS media_participants (
  id INT PRIMARY KEY AUTO_INCREMENT,
  media_id INT NOT NULL,
  participant_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (media_id) REFERENCES person_media(id) ON DELETE CASCADE,
  INDEX idx_media_participants (media_id)
);

-- Inserir alguns dados de exemplo (opcional - remova se não quiser dados de teste)
-- INSERT INTO person_media (person_id, user_id, type, title, description, date, is_favorite) 
-- VALUES 
-- (1, 1, 'meeting', 'Reunião de Planejamento', 'Discussão sobre estratégias para 2025', '2024-01-15', true),
-- (1, 1, 'document', 'Proposta de Parceria', 'Documento com termos da parceria', '2024-01-10', false),
-- (1, 1, 'audio', 'Conversa sobre Projeto X', 'Gravação da conversa telefônica', '2024-01-08', false);

-- Verificar se as tabelas foram criadas
SHOW TABLES LIKE '%media%';
