// src/controllers/workScheduleController.js
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Obter configuração de horário
exports.getWorkSchedule = async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('work_schedule')
      .select('*')
      .limit(1)
      .single();

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar configuração de horário:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Atualizar configuração de horário
exports.updateWorkSchedule = async (req, res) => {
  try {
    const {
      start_time,
      end_time,
      work_days,
      late_tolerance,
      daily_hours,
      auto_checkout,
      require_location
    } = req.body;

    // Validações básicas
    if (start_time && !isValidTimeFormat(start_time)) {
      return res.status(400).json({ message: 'Formato de hora de início inválido. Use o formato HH:MM' });
    }

    if (end_time && !isValidTimeFormat(end_time)) {
      return res.status(400).json({ message: 'Formato de hora de fim inválido. Use o formato HH:MM' });
    }

    // Verificar se já existe uma configuração
    const { data: existingConfig } = await supabase
      .from('work_schedule')
      .select('*')
      .limit(1);

    let result;

    if (existingConfig && existingConfig.length > 0) {
      // Atualizar configuração existente
      const updates = {};
      if (start_time) updates.start_time = start_time;
      if (end_time) updates.end_time = end_time;
      if (work_days) updates.work_days = work_days;
      if (late_tolerance !== undefined) updates.late_tolerance = late_tolerance;
      if (daily_hours !== undefined) updates.daily_hours = daily_hours;
      if (auto_checkout !== undefined) updates.auto_checkout = auto_checkout;
      if (require_location !== undefined) updates.require_location = require_location;

      const { data, error } = await supabase
        .from('work_schedule')
        .update(updates)
        .eq('id', existingConfig[0].id)
        .select();

      if (error) throw error;
      result = data[0];
    } else {
      // Criar nova configuração
      const newConfig = {
        id: uuidv4(),
        start_time: start_time || '08:00',
        end_time: end_time || '17:00',
        work_days: work_days || [1, 2, 3, 4, 5], // Segunda a Sexta por padrão
        late_tolerance: late_tolerance !== undefined ? late_tolerance : 15,
        daily_hours: daily_hours || 8.0,
        auto_checkout: auto_checkout || false,
        require_location: require_location || false,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('work_schedule')
        .insert([newConfig])
        .select();

      if (error) throw error;
      result = data[0];
    }

    return res.status(200).json({
      message: 'Configuração de horário atualizada com sucesso',
      work_schedule: result
    });
  } catch (error) {
    console.error('Erro ao atualizar configuração de horário:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Função para validar formato de hora
function isValidTimeFormat(timeStr) {
  const regex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return regex.test(timeStr);
}