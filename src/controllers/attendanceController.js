// src/controllers/attendanceController.js
const supabase = require('../config/supabase');
const { v4: uuidv4 } = require('uuid');

// Obter registros de ponto (com filtros)
exports.getAttendance = async (req, res) => {
  try {
    const { employee_id, start_date, end_date, date } = req.query;
    
    let query = supabase
      .from('attendance')
      .select(`
        *,
        employee:employees (
          id,
          name,
          internal_code
        )
      `);
    
    // Aplicar filtros se fornecidos
    if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }
    
    if (date) {
      query = query.eq('date', date);
    } else if (start_date && end_date) {
      query = query
        .gte('date', start_date)
        .lte('date', end_date);
    }
    
    const { data, error } = await query.order('date', { ascending: false });

    if (error) throw error;

    return res.status(200).json(data);
  } catch (error) {
    console.error('Erro ao buscar registros de ponto:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Registrar ponto (entrada ou saída)
exports.registerAttendance = async (req, res) => {
  try {
    const { employee_id, employee_code, auth_method, observations } = req.body;
    
    // Verifica se foi fornecido ID ou código
    if (!employee_id && !employee_code) {
      return res.status(400).json({ 
        message: 'É necessário informar o ID ou código do funcionário' 
      });
    }
    
    // Busca o funcionário pelo código, se fornecido
    let employeeData;
    
    if (employee_code) {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('internal_code', employee_code)
        .single();
      
      if (!employee) {
        return res.status(404).json({ message: 'Funcionário não encontrado' });
      }
      
      employeeData = employee;
    } else {
      const { data: employee } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employee_id)
        .single();
        
      if (!employee) {
        return res.status(404).json({ message: 'Funcionário não encontrado' });
      }
      
      employeeData = employee;
    }
    
    // Busca configuração de horário de trabalho
    const { data: workSchedule } = await supabase
      .from('work_schedule')
      .select('*')
      .limit(1)
      .single();
    
    if (!workSchedule) {
      return res.status(404).json({ message: 'Configuração de horário não encontrada' });
    }
    
    // Obtém data e hora atual
    const now = new Date();
    const today = now.toISOString().split('T')[0]; // Formato YYYY-MM-DD
    const currentTime = now.toTimeString().split(' ')[0].substring(0, 5); // Formato HH:MM
    
    // Busca registro existente para hoje
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('*')
      .eq('employee_id', employeeData.id)
      .eq('date', today)
      .single();
    
    // Lógica de registro (entrada ou saída)
    if (!existingRecord) {
      // Primeira marcação do dia (entrada)
      
      // Calcula minutos de atraso
      const lateMinutes = calculateLateMinutes(currentTime, workSchedule.start_time);
      
      // Determina status baseado no atraso e tolerância
      const status = lateMinutes > workSchedule.late_tolerance ? 'Atrasado' : 'Presente';
      
      // Cria registro de entrada
      const newRecord = {
        id: uuidv4(),
        employee_id: employeeData.id,
        date: today,
        check_in: currentTime,
        late_minutes: lateMinutes,
        status,
        observations: observations || null,
        auth_method: auth_method || 'code',
        created_at: now.toISOString(),
      };
      
      const { data, error } = await supabase
        .from('attendance')
        .insert([newRecord]);
      
      if (error) throw error;
      
      return res.status(201).json({ 
        message: `Bom dia ${employeeData.name}! Entrada registrada com sucesso às ${currentTime}.`,
        attendance: newRecord
      });
      
    } else if (!existingRecord.check_out) {
      // Já tem registro de entrada, mas não de saída
      
      // Atualiza com horário de saída
      const { data, error } = await supabase
        .from('attendance')
        .update({
          check_out: currentTime,
          status: 'Presente', // Atualiza status final
          observations: observations ? (existingRecord.observations ? existingRecord.observations + ' | ' + observations : observations) : existingRecord.observations
        })
        .eq('id', existingRecord.id)
        .select();
      
      if (error) throw error;
      
      return res.status(200).json({ 
        message: `Até amanhã ${employeeData.name}! Saída registrada com sucesso às ${currentTime}.`,
        attendance: data[0]
      });
      
    } else {
      // Já registrou entrada e saída hoje
      return res.status(400).json({ 
        message: `${employeeData.name} já registrou entrada e saída hoje.`
      });
    }
  } catch (error) {
    console.error('Erro ao registrar ponto:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Atualizar registro de ponto (para administradores)
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { check_in, check_out, status, observations } = req.body;
    
    // Verifica se o registro existe
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('*')
      .eq('id', id)
      .single();
      
    if (!existingRecord) {
      return res.status(404).json({ message: 'Registro de ponto não encontrado' });
    }

    const updates = {};
    if (check_in) updates.check_in = check_in;
    if (check_out) updates.check_out = check_out;
    if (status) updates.status = status;
    if (observations !== undefined) updates.observations = observations;

    // Se o horário de entrada foi alterado, recalcular atraso
    if (check_in) {
      // Busca configuração de horário
      const { data: workSchedule } = await supabase
        .from('work_schedule')
        .select('*')
        .limit(1)
        .single();
        
      if (workSchedule) {
        updates.late_minutes = calculateLateMinutes(check_in, workSchedule.start_time);
      }
    }

    const { data, error } = await supabase
      .from('attendance')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;

    return res.status(200).json({ 
      message: 'Registro de ponto atualizado com sucesso', 
      attendance: data[0] 
    });
  } catch (error) {
    console.error('Erro ao atualizar registro de ponto:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Excluir registro de ponto
exports.deleteAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return res.status(200).json({ 
      message: 'Registro de ponto excluído com sucesso' 
    });
  } catch (error) {
    console.error('Erro ao excluir registro de ponto:', error);
    return res.status(500).json({ error: error.message });
  }
};

// Função para calcular minutos de atraso
function calculateLateMinutes(timeIn, startTime) {
  const [inHour, inMinute] = timeIn.split(':').map(Number);
  const [startHour, startMinute] = startTime.split(':').map(Number);

  const totalInMinutes = inHour * 60 + inMinute;
  const totalStartMinutes = startHour * 60 + startMinute;

  return Math.max(0, totalInMinutes - totalStartMinutes);
}