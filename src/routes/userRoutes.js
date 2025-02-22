// src/routes/userRoutes.js (Usa MySQL sem conexões abertas)
// Rota de usuários sem conexão permanente.

const express = require('express');
/* 
Essa linha importa o módulo Express, um framework para Node.js usado para criar aplicações web e APIs de forma simples 
e eficiente. 
O que isso significa?
O Express facilita a criação de servidores HTTP.
Ele oferece suporte a rotas, middlewares, requisições e respostas HTTP.
*/

const { getUsers, getUserById, createUser, loginUser, updateUser, deleteUser, authenticateToken } = require('../controllers/userController');
/*
Aqui estamos importando funções do arquivo userController.js, localizado na pasta controllers.
O que isso significa?
Cada função contém a lógica para interagir com o banco de dados MySQL e realizar operações CRUD.
{ getUsers, getUserById, createUser, updateUser, deleteUser } usa desestruturação, ou seja, estamos extraindo funções específicas do módulo userController.
*/

const router = express.Router();
/*
Essa linha cria um novo objeto Router do Express, permitindo definir rotas de forma modular.
O que isso significa?
Em vez de definir todas as rotas diretamente no server.js, usamos o Router() para organizar melhor o código.
Isso torna a aplicação mais modular e fácil de manter.
*/

router.get('/users', getUsers);
/*
Define uma rota GET no caminho /, que, ao ser acessada, executa a função getUsers.
O que isso significa?
Quando um cliente faz uma requisição GET para /api/users, o servidor executa getUsers e retorna os usuários.
getUsers consulta o banco de dados e envia os usuários como resposta em JSON.
*/

router.get('/users/:id', getUserById);
/*
Define uma rota GET no caminho /:id, que executa a função getUserById.
O que isso significa?
Quando um cliente faz uma requisição GET para /api/users/:id, o servidor busca um usuário específico pelo ID.
getUserById consulta o banco de dados e retorna o usuário correspondente em JSON.
*/

router.post('/users', createUser);
/*
Define uma rota POST no caminho /, que executa a função createUser.
O que isso significa?
Quando um cliente faz uma requisição POST para /api/users, o servidor cria um novo usuário no banco de dados.
createUser recebe os dados no corpo da requisição e os insere no banco de dados.
*/

router.post('/login', loginUser);

router.put('/users/:id', updateUser);
/*
Define uma rota PUT no caminho /:id, que executa a função updateUser.
O que isso significa?
Quando um cliente faz uma requisição PUT para /api/users/:id, o servidor atualiza os dados de um usuário específico.
updateUser recebe os novos dados no corpo da requisição e atualiza o usuário no banco de dados.
*/

router.delete('/users/:id', deleteUser);
/*
Define uma rota DELETE no caminho /:id, que executa a função deleteUser.
O que isso significa?
Quando um cliente faz uma requisição DELETE para /api/users/:id, o servidor remove o usuário correspondente do banco de dados.
deleteUser deleta o usuário pelo ID e retorna uma confirmação.
*/

router.use(authenticateToken);
//router.get('/auth', authenticateToken);

module.exports = router;
/*
Exporta o objeto router para ser usado em outros arquivos.
O que isso significa?
Isso permite que o server.js importe e use as rotas definidas aqui.
No server.js, você pode importar com:
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);
Assim, qualquer requisição para /api/users será tratada por esse router.
*/

/*
Resumo do fluxo do código:
Importa o Express e as funções do userController.
Cria um roteador com express.Router().
Define as rotas GET, POST, PUT e DELETE.
Exporta o roteador para ser usado em server.js.
*/
