// src/routes/migrationRoutes.js (Rota para migração)
// Chama o controller de migração. Define a rota para iniciar a migração.

const express = require("express");
/*
Importa o módulo Express, um framework para Node.js que facilita a criação de servidores e o gerenciamento de rotas.
require("express") carrega a biblioteca Express para uso no código.
*/

const router = express.Router();
/*
Cria um roteador do Express usando express.Router().
O roteador permite definir rotas de forma modular e reutilizável, facilitando a organização do código.
Em vez de definir rotas diretamente no server.js, podemos gerenciá-las em arquivos separados.
*/

const { migrateData } = require("../controllers/migrationController");
/*
Importa a função migrateData do arquivo migrationController.js.
{ migrateData } é uma desestruturação de objeto, ou seja, significa que o migrationController.js exporta um objeto 
contendo essa função.
O controlador (migrationController.js) contém a lógica da migração de dados entre bancos de dados.
*/

router.post("/migrate", migrateData);
/*
Cria uma rota do tipo POST no caminho "/migrate".
Sempre que um cliente (como Postman, navegador ou frontend) fizer uma requisição POST para 
http://localhost:3000/api/migrate, o Express chamará a função migrateData.
Por que POST e não GET?
Como a migração modifica dados, POST é mais adequado do que GET, que deve ser usado apenas para leitura de dados.
*/

module.exports = router;
/*
Exporta o roteador (router) para que possa ser importado em outro arquivo, como server.js.
Isso permite que as rotas sejam organizadas separadamente do servidor principal, tornando o código modular e fácil 
de manter.
*/

/*
Resumo do fluxo do código:
Esse código define uma rota POST /migrate, que quando acessada, executa a função migrateData, responsável por migrar 
os dados entre bancos MongoDB. O uso de express.Router() permite modularizar o código, facilitando manutenção e 
escalabilidade. 🚀
*/

