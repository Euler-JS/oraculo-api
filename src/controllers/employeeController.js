// src/controllers/employeeController.js
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Obter todos os funcionários
exports.getAllEmployees = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar funcionários:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Obter funcionário por ID
exports.getEmployeeById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Funcionário não encontrado' });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar funcionário:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Obter funcionário por código interno
exports.getEmployeeByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .eq('internal_code', code)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Funcionário não encontrado' });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar funcionário pelo código:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Criar funcionário
exports.createEmployee = async (req, res) => {
  try {
    const { name, position, department, internal_code } = req.body;

    // Validações básicas
    if (!name || !position || !department) {
      return res.status(400).json({ message: 'Nome, cargo e departamento são obrigatórios' });
    }

    // Gerar um código interno se não for fornecido
    let employeeCode = internal_code;
    if (!employeeCode) {
      // Formato AEM + 4 dígitos aleatórios para reduzir colisões
      let isUnique = false;
      let attempts = 0;
      while (!isUnique && attempts < 10) {
        const randomDigits = Math.floor(Math.random() * 9000 + 1000); // 1000-9999
        employeeCode = `AEM${randomDigits}`;
        
        // Verificar se o código já existe
        const { data } = await supabase
          .from('employees')
          .select('internal_code')
          .eq('internal_code', employeeCode);
          
        if (!data || data.length === 0) {
          isUnique = true;
        }
        attempts++;
      }
      
      if (!isUnique) {
        // Fallback: usar timestamp
        employeeCode = `AEM${Date.now().toString().slice(-4)}`;
      }
    }

    const newEmployee = {
      id: uuidv4(),
      name,
      position,
      department,
      internal_code: employeeCode,
      qr_code: employeeCode, // Pode ser modificado para usar um hash mais seguro
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('employees')
      .insert([newEmployee]);

    if (error) throw error;

    return res.status(201).json({ 
      message: 'Funcionário criado com sucesso', 
      employee: newEmployee 
    });
  } catch (error) {
    console.error('Erro ao criar funcionário:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Atualizar funcionário
exports.updateEmployee = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, position, department } = req.body;
    
    // Verifica se o funcionário existe
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
      
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    const updates = {};
    if (name) updates.name = name;
    if (position) updates.position = position;
    if (department) updates.department = department;

    const { data, error } = await supabase
      .from('employees')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.status(200).json({ 
      message: 'Funcionário atualizado com sucesso', 
      employee: data[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar funcionário:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Excluir funcionário
exports.deleteEmployee = async (req, res) => {
  try {
    const { id } = req.params;

    // Verifica se o funcionário existe
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
      
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ 
      message: 'Funcionário excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Registrar face do funcionário
exports.registerFace = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!req.file) {
      return res.status(400).json({ message: 'Imagem da face é obrigatória' });
    }
    
    // Verifica se o funcionário existe
    const { data: existingEmployee } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .single();
      
    if (!existingEmployee) {
      return res.status(404).json({ message: 'Funcionário não encontrado' });
    }
    
    // Importar função de reconhecimento facial
    const { generateFaceEmbedding } = require('../utils/faceRecognition');
    
    // Gerar embedding da face
    const faceEmbedding = await generateFaceEmbedding(req.file.buffer);
    
    // Atualizar funcionário com embedding facial
    const { data, error } = await supabase
      .from('employees')
      .update({
        face_embedding: JSON.stringify(Array.from(faceEmbedding))
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    return res.status(200).json({ 
      message: 'Face registrada com sucesso',
      employee: data[0]
    });
  } catch (error) {
    console.error('Erro ao registrar face:', error);
    return res.status(500).json({ error: error.message });
  }
};