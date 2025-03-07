/*
src/config/mongoConfig.js (Conexão MongoDB sob demanda)
Objetivo: Criar conexões temporárias com o MongoDB sob demanda, garantindo que a conexão seja aberta apenas quando
necessário e fechada após a operação para evitar o consumo de recursos.
*/

const { MongoClient } = require("mongodb");
/*
Importa a classe MongoClient do pacote oficial mongodb.
O MongoClient é utilizado para estabelecer conexões com o banco de dados MongoDB.
*/

require("dotenv").config();
/*
Carrega as variáveis de ambiente do arquivo .env (exemplo: MONGO_URI).
Isso permite configurar a conexão sem expor credenciais diretamente no código-fonte.
*/

async function queryMongoDB(dbName, collectionName, operation) {
/*
Declara uma função assíncrona chamada queryMongoDB, que recebe:
- dbName → Nome do banco de dados a ser acessado.
- collectionName → Nome da coleção (tabela no MongoDB) onde a operação será executada.
- operation → Função assíncrona contendo a operação a ser realizada na coleção.
A função é assíncrona para permitir o uso de await, garantindo a execução fluida das operações.
*/

  const client = new MongoClient(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  /*
  Cria uma nova instância do MongoClient, configurando:
  - process.env.MONGO_URI: URL de conexão com o MongoDB obtida do .env.
  - { useNewUrlParser: true, useUnifiedTopology: true }: Configurações recomendadas para compatibilidade.
  */

  try {
    await client.connect();
    /*
    Estabelece a conexão com o MongoDB utilizando await client.connect().
    O uso de await garante que a execução aguarde a conexão antes de prosseguir.
    */

    console.log(`✅ Conectado ao MongoDB: ${dbName}`);
    // Exibe uma mensagem de sucesso no console ao conectar ao banco de dados.

    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    /*
    Obtém a referência ao banco de dados e à coleção específica onde a operação será executada.
    */

    const result = await operation(collection);
    /*
    Executa a operação passada como parâmetro, que interage com a coleção no MongoDB.
    O await garante que a operação seja concluída antes de continuar.
    */

    return result;
    /*
    Retorna os resultados da operação para a função chamadora.
    */
  } catch (error) {
    console.error("❌ Erro no MongoDB:", error);
    throw error;
    /*
    Captura e exibe erros que possam ocorrer durante a conexão ou execução da operação.
    Lança o erro para que possa ser tratado na camada superior do código.
    */
  } finally {
    await client.close();
    console.log("🔌 Conexão com MongoDB fechada.");
    /*
    Garante que a conexão com o MongoDB será fechada após a operação, evitando conexões pendentes.
    O uso do finally assegura que a conexão será fechada mesmo em caso de erro.
    */
  }
}

module.exports = { queryMongoDB };
/*
Exporta a função queryMongoDB para ser utilizada em outros arquivos do projeto.
Isso permite executar operações no MongoDB de forma segura e reutilizável.
*/

/*
Resumo do Funcionamento:
1. queryMongoDB() é chamada com os parâmetros:
   - dbName: Nome do banco de dados.
   - collectionName: Nome da coleção dentro do banco de dados.
   - operation: Função contendo a operação a ser executada na coleção.

2. O código:
   a) Cria uma conexão temporária com o MongoDB.
   b) Obtém a referência ao banco de dados e à coleção.
   c) Executa a operação, que foi chamada dentro da função queryMongo(), na coleção.
   d) Fecha a conexão antes de retornar os resultados.

3. Benefícios:
   - Evita conexões abertas desnecessárias, otimizando o uso de recursos.
   - Mantém um código limpo e reutilizável.
   - Facilita a execução de operações no MongoDB sem a necessidade de reescrever código de conexão.
*/
