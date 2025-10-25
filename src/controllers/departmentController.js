// src/controllers/departmentController.js
const supabase = require('../config/supabase');

// Obter todos os departamentos
exports.getAllDepartments = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar departamentos:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Obter departamento por ID
exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return res.status(404).json({ message: 'Departamento não encontrado' });

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar departamento:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Criar departamento
exports.createDepartment = async (req, res) => {
  try {
    const { name } = req.body;

    // Validação básica
    if (!name) {
      return res.status(400).json({ message: 'Nome do departamento é obrigatório' });
    }

    // Verificar se já existe um departamento com este nome
    const { data: existingDepartment } = await supabase
      .from('departments')
      .select('*')
      .eq('name', name);

    if (existingDepartment && existingDepartment.length > 0) {
      return res.status(400).json({ message: 'Já existe um departamento com este nome' });
    }

    const { data, error } = await supabase
      .from('departments')
      .insert([{ name }]);

    if (error) throw error;

    // Buscar o departamento criado para retornar
    const { data: createdDepartment } = await supabase
      .from('departments')
      .select('*')
      .eq('name', name)
      .single();

    return res.status(201).json({
      message: 'Departamento criado com sucesso',
      department: createdDepartment
    });
  } catch (error) {
    console.error('Erro ao criar departamento:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Atualizar departamento
exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    // Validação básica
    if (!name) {
      return res.status(400).json({ message: 'Nome do departamento é obrigatório' });
    }

    // Verificar se o departamento existe
    const { data: existingDepartment } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (!existingDepartment) {
      return res.status(404).json({ message: 'Departamento não encontrado' });
    }

    // Verificar se já existe outro departamento com este nome
    const { data: duplicateName } = await supabase
      .from('departments')
      .select('*')
      .eq('name', name)
      .neq('id', id);

    if (duplicateName && duplicateName.length > 0) {
      return res.status(400).json({ message: 'Já existe outro departamento com este nome' });
    }

    const { data, error } = await supabase
      .from('departments')
      .update({ name })
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.status(200).json({ 
      message: 'Departamento atualizado com sucesso', 
      department: data[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar departamento:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Excluir departamento
exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se o departamento existe
    const { data: existingDepartment } = await supabase
      .from('departments')
      .select('*')
      .eq('id', id)
      .single();
      
    if (!existingDepartment) {
      return res.status(404).json({ message: 'Departamento não encontrado' });
    }

    // Verificar se existem funcionários neste departamento
    const { data: employees } = await supabase
      .from('employees')
      .select('count')
      .eq('department', existingDepartment.name);

    if (employees && employees.length > 0 && employees[0].count > 0) {
      return res.status(400).json({ 
        message: 'Não é possível excluir o departamento porque existem funcionários associados a ele'
      });
    }

    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ 
      message: 'Departamento excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir departamento:', error);
    return res.status(500).json({ error: error.message });
  }
};