// src/controllers/authController.js
const supabase = require('../config/supabase');

// Login de usuário
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({ message: 'Email e senha são obrigatórios' });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      user: data.user,
      session: data.session,
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    return res.status(401).json({ error: error.message });
  }
};