// src/controllers/userController.js (CRUD de usuários no MySQL com conexão sob demanda)
// Cada requisição abre e fecha a conexão para otimizar recursos.

const { queryDatabase } = require("../config/mysqlConfig");
//const { connectToMySQL } = require('../config/mysqlConfig');
/*
Importa a função connectToMySQL, que gerencia a conexão sob demanda com o MySQL.
Permite abrir e fechar a conexão de forma eficiente para cada requisição.
*/

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 🟢 Função para obter todos os usuários
async function getUsers(req, res) {
  try {
    const result = await queryDatabase('SELECT id, name, username, email, telefone FROM users');
    res.json(result);
  } catch (error) {
    console.error('❌ Erro ao buscar usuários:', error);
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
}

// 🟢 Função para obter um usuário pelo ID
async function getUserById(req, res) {
  const { id } = req.params;
  try {
    const result = await queryDatabase('SELECT id, name, username, email, telefone FROM users WHERE id = ?', [id]);
    if (result.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json(result[0]);
  } catch (error) {
    console.error('❌ Erro ao buscar usuário:', error);
    res.status(500).json({ error: 'Erro ao buscar usuário' });
  }
}

// 🟢 Função para criar um novo usuário com senha criptografada
async function createUser(req, res) {
  const { name, username, email, telefone, password } = req.body;
  if (!name || !username || !email || !telefone || !password) {
    return res.status(400).json({ error: 'Nome, username, e-mail, telefone e senha são obrigatórios' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await queryDatabase(
      'INSERT INTO users (name, username, email, telefone, password) VALUES (?, ?, ?, ?, ?)',
      [name, username, email, telefone, hashedPassword]
    );
    res.status(201).json({ message: 'Usuário criado com sucesso', userId: result.insertId });
  } catch (error) {
    console.error('❌ Erro ao criar usuário:', error);
    res.status(500).json({ error: 'Erro ao criar usuário' });
  }
}

// 🟢 Função para autenticar usuário e gerar token JWT
async function loginUser(req, res) {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
  }

  try {
    const result = await queryDatabase('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0) {
      return res.status(400).json({ error: 'Usuário não encontrado' });
    }

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Senha incorreta' });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ message: 'Login efetuado com sucesso', user: { id: user.id, name: user.name, email: user.email }, token });
  } catch (error) {
    console.error('❌ Erro ao autenticar usuário:', error);
    res.status(500).json({ error: 'Erro no servidor' });
  }
}

// 🟢 Middleware para verificar token JWT
function authenticateToken(req, res, next) {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Acesso negado' });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Token inválido' });
  }
}

// 🟢 Função para atualizar um usuário dinamicamente
async function updateUser(req, res) {
  const { id } = req.params;
  const fields = req.body;

  if (Object.keys(fields).length === 0) {
    return res.status(400).json({ error: 'Pelo menos um campo deve ser atualizado' });
  }

  try {
    // Construir a query dinamicamente
    const updates = Object.keys(fields).map(key => `${key} = ?`).join(', ');
    const values = Object.values(fields);

    // Adicionar o ID ao final da lista de valores
    values.push(id);

    const query = `UPDATE users SET ${updates} WHERE id = ?`;

    const result = await queryDatabase(query, values);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário atualizado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao atualizar usuário:', error);
    res.status(500).json({ error: 'Erro ao atualizar usuário' });
  }
}

// 🟢 Função para deletar um usuário
async function deleteUser(req, res) {
  const { id } = req.params;
  try {
    const result = await queryDatabase('DELETE FROM users WHERE id = ?', [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }
    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    console.error('❌ Erro ao deletar usuário:', error);
    res.status(500).json({ error: 'Erro ao deletar usuário' });
  }
}

module.exports = {
  getUsers,
  getUserById,
  createUser,
  loginUser,
  updateUser,
  deleteUser,
  authenticateToken
};



