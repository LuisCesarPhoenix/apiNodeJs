// server.js (Inicia o servidor sem abrir conexões)
const express = require("express");
/*
Importa o framework Express, que facilita a criação de servidores web e APIs no Node.js.
require("express") carrega o módulo do Express, permitindo que ele seja usado no código.
*/

const app = express();
/*
Cria uma instância do Express chamada app.
app representa o servidor da aplicação e é usado para definir rotas, middlewares e configurações.
*/

const migrationRoutes = require("./src/routes/migrationRoutes");
/*
Importa o arquivo migrationRoutes.js, que contém as rotas responsáveis por lidar com a migração de dados.
require("./src/routes/migrationRoutes") carrega esse módulo para ser usado no servidor.
*/

const fileProcessingRoutes = require("./src/routes/fileProcessingRoutes");
/*
Importa as rotas definidas no arquivo "fileProcessingRoutes.js", localizado dentro da pasta "src/routes".
*/

const userRoutes = require("./src/routes/userRoutes");
/*
Importa as rotas de usuário, que são responsáveis pelo CRUD de usuários no MySQL.
*/

app.use(express.json());
/*
Adiciona um middleware que permite o servidor interpretar requisições com JSON no corpo.
Sem isso, o Express não conseguiria processar req.body em requisições do tipo POST ou PUT enviadas como JSON.
*/

app.use("/api", migrationRoutes);
/*
Define um prefixo "/api" para todas as rotas importadas de migrationRoutes.js.
Se migrationRoutes tiver uma rota /migrate, ela será acessível via /api/migrate.
*/

app.use("/api", fileProcessingRoutes);
/*
Adiciona as rotas de processamento de arquivos à aplicação Express, definindo o prefixo "/api" para acessá-las.
Isso significa que todas as rotas definidas em "fileProcessingRoutes.js" serão acessadas através do caminho "/api".
Por exemplo, se houver uma rota "/process/:filename" dentro de "fileProcessingRoutes.js",
ela será acessível via "POST /api/process/:filename".
*/

app.use("/api", userRoutes);
/*
Adiciona as rotas de usuário à aplicação Express, definindo o prefixo "/api" para acessá-las.
Agora, as rotas de usuário serão acessadas via "/api/users", "/api/users/:id", etc.
*/

const PORT = process.env.PORT || 3000;
/*
Define a porta onde o servidor vai rodar.
Se existir a variável de ambiente PORT, ele usa esse valor; caso contrário, usa a porta padrão 3000.
*/

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
/*
Inicia o servidor Express e faz com que ele escute conexões na porta definida.
Quando o servidor começa a rodar, ele exibe a mensagem "🚀 Servidor rodando em http://localhost:PORT" no terminal.
*/

/*
Resumo do fluxo do código:
Esse código cria um servidor Express que:
- Aceita requisições JSON.
- Define um prefixo /api para as rotas.
- Importa as rotas de migração, processamento de arquivos e de usuários.
- Escuta conexões na porta 3000 (ou outra definida no ambiente)
*/
