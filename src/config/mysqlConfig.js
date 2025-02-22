/*
src/config/mysqlConfig.js (Conexão MySQL sob demanda)
Cria a conexão só quando necessário e fecha após a requisição. 
Objetivo: Gerenciar conexões temporárias com o MySQL, garantindo que a conexão seja aberta apenas quando necessário 
e fechada após a execução da consulta.
*/

const mysql = require("mysql2/promise");
/*
Importa o pacote mysql2 com suporte a Promise, permitindo o uso de async/await.
Isso evita o uso de callbacks e melhora a legibilidade do código.
*/

require("dotenv").config();
/*
Carrega variáveis de ambiente do arquivo .env (exemplo: DB_HOST, DB_USER).
Isso mantém as credenciais seguras e evita expô-las diretamente no código.
*/

async function queryDatabase(query, params = []) {
/*
Define uma função assíncrona chamada queryDatabase para executar consultas no MySQL.
Parâmetros:
a) query: A string SQL que será executada.
b) params: Um array de valores a serem passados para a query (opcional, padrão é []).
*/
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  /*
  Cria uma conexão temporária com o banco de dados.
  Usa process.env para obter as credenciais do MySQL definidas no .env.
  await garante que o código aguarde a conexão antes de continuar.
  */

  try {
    const [rows] = await connection.execute(query, params);
    await connection.end(); // ✅ Fechando a conexão antes de retornar os dados.
    console.log("🔌 Conexão com MySQL fechada.");
    return rows;
    /*
    Executa a query no MySQL com connection.execute(query, params).
    O await aguarda a execução da consulta antes de seguir.
    Fecha a conexão antes de retornar os resultados para evitar conexões pendentes.
    Retorna os resultados da consulta (rows).
    */
  } catch (error) {
    console.error("❌ Erro no MySQL:", error);
    throw error;
    /*
    Se houver erro ao executar a query, captura e exibe no console.
    Lança (throw error) o erro para que a aplicação possa tratá-lo.
     */
  } finally {
    if (connection && connection.end) {
      connection.end().catch(err => console.error("Erro ao fechar conexão MySQL:", err));
    }
    /*
    Garante que a conexão será fechada, independentemente do sucesso ou erro.
    Usa connection.end().catch() para capturar possíveis erros ao fechar a conexão.
    */
  }
}

module.exports = { queryDatabase };
/*
Exporta queryDatabase para que outros arquivos possam chamá-la.
Permite que qualquer parte do projeto execute consultas no MySQL de forma segura e eficiente.
*/

/*
Resumo do Funcionamento
1-queryDatabase() é chamada com a consulta SQL e parâmetros opcionais.
2-Cria uma conexão temporária com o banco de dados.
3-Executa a consulta e fecha a conexão antes de retornar os dados.
4-Se houver erro, captura e exibe no console.
5-Usa um finally para garantir que a conexão será fechada, mesmo em caso de erro.
*/

/* 
Benefícios desse código:
Conexões otimizadas: Abre e fecha conexões sob demanda, evitando consumo desnecessário de recursos.
Código limpo e reutilizável: Pode ser chamado de qualquer parte do projeto para executar consultas.
Segurança: Usa variáveis de ambiente para proteger credenciais.
Assíncrono: Usa async/await para melhor performance e legibilidade.
*/
