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

const { getUsers, getUserById, createUser, updateUser, deleteUser, loginUser, authenticateToken } = require('../controllers/userController');
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

router.post('/login', loginUser);
/*
1-Define uma rota POST no caminho /login.
2-Associa essa rota à função loginUser, que está importada do userController.js.
3-Quando um usuário faz uma requisição POST para /login, o servidor chama a função loginUser, que:
a) Recebe o e-mail e a senha no corpo da requisição.
b) Consulta o banco de dados para verificar se o usuário existe.
c) Compara a senha fornecida com a senha criptografada no banco usando bcrypt.
d) Se estiver correta, gera um token JWT e retorna para o usuário.
e) Caso contrário, retorna um erro.
*/

//router.get('/auth', authenticateToken);
router.use(authenticateToken);
/*
a) Adiciona um middleware global para todas as rotas definidas depois dessa linha.
b) Isso significa que qualquer rota definida abaixo dessa linha exigirá um token JWT válido.
Como funciona o middleware authenticateToken?
1-Verifica se há um token JWT no cabeçalho da requisição (Authorization).
2-Caso o token esteja presente, ele decodifica o token usando jsonwebtoken (jwt.verify).
3-Se o token for válido, adiciona as informações do usuário no objeto req.user e a requisição segue normalmente.
4-Se o token for inválido ou ausente, retorna um erro 401 (Não autorizado).
*/

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
Antes dessa linha (router.use(authenticateToken);), qualquer rota pode ser acessada sem autenticação.
Depois dessa linha, todas as rotas exigem um token válido.
Exporta o roteador para ser usado em server.js.
*/



