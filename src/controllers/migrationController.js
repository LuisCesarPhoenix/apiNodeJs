const { MongoClient } = require("mongodb");
/*
Importa o módulo MongoDB e extrai a classe MongoClient.
MongoClient permite conectar-se a um banco de dados MongoDB e interagir com ele.
*/

const { queryMongoDB } = require("../config/mongoConfig");
/*
Importa a função queryMongoDB de um arquivo de configuração (mongoConfig.js).
Essa função pode ser usada para interagir com o MongoDB de maneira centralizada.
*/

require("dotenv").config();
/*
Carrega variáveis de ambiente do arquivo .env.
Isso permite armazenar credenciais de conexão e configurações sensíveis fora do código-fonte.
*/

const COLLECTION_OLD = process.env.MONGO_COLLECTION_OLD;
/*
Armazena o nome da coleção antiga (de onde os dados serão extraídos) em uma constante.
O valor é carregado a partir da variável de ambiente MONGO_COLLECTION_OLD.
*/

const COLLECTION_NEW = process.env.MONGO_COLLECTION_NEW;
/*
Armazena o nome da nova coleção (para onde os dados serão inseridos).
O valor vem da variável de ambiente MONGO_COLLECTION_NEW.
*/

const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 1000;
/*
Define o tamanho do lote (quantidade de documentos processados por vez).
Converte a variável de ambiente BATCH_SIZE para um número inteiro.
Se BATCH_SIZE não estiver definida, o padrão será 1000.
*/

async function migrateData(req, res) {
/*
Declara uma função assíncrona chamada migrateData.
Essa função realiza a migração de dados entre coleções MongoDB.
Recebe req (requisição HTTP) e res (resposta HTTP) como parâmetros.
*/

  let clientOld, clientNew;
  /*
  Declara duas variáveis para armazenar os clientes de conexão com os bancos antigos e novos.
  Elas serão usadas para gerenciar a conexão com cada banco de dados.
  */

  try {
    console.log(`🔄 Iniciando migração da coleção "${COLLECTION_OLD}" para "${COLLECTION_NEW}"...`);
    /*
    Exibe no console o início do processo de migração, incluindo os nomes das coleções envolvidas.
    */

    // Criando conexões manuais para garantir persistência durante a migração
    clientOld = new MongoClient(process.env.MONGO_URI_OLD, { useNewUrlParser: true, useUnifiedTopology: true });
    /*
    Cria uma conexão com o banco de dados antigo.
    - MONGO_URI_OLD contém a URL de conexão.
    - useNewUrlParser: true garante a compatibilidade com a nova sintaxe de conexão do MongoDB.
    - useUnifiedTopology: true ativa o novo mecanismo de gerenciamento de conexões.
    */

    await clientOld.connect();
    /*
    Estabelece a conexão com o banco de dados antigo.
    O uso de await garante que a execução só continue após a conexão ser concluída.
    */

    const oldDb = clientOld.db(process.env.MONGO_DB_OLD);
    /*
    Obtém uma referência ao banco de dados antigo, cujo nome é armazenado na variável MONGO_DB_OLD.
    */

    const oldCollection = oldDb.collection(COLLECTION_OLD);
    /*
    Obtém uma referência à coleção antiga, de onde os documentos serão extraídos.
    */

    clientNew = new MongoClient(process.env.MONGO_URI_NEW, { useNewUrlParser: true, useUnifiedTopology: true });
    /*
    Cria uma conexão com o banco de dados novo usando as mesmas configurações da conexão anterior.
    */

    await clientNew.connect();
    /*
    Estabelece a conexão com o banco de dados novo.
    */

    const newDb = clientNew.db(process.env.MONGO_DB_NEW);
    /*
    Obtém uma referência ao banco de dados novo, definido na variável de ambiente MONGO_DB_NEW.
    */

    const newCollection = newDb.collection(COLLECTION_NEW);
    /*
    Obtém uma referência à nova coleção, onde os documentos serão inseridos.
    */

    let totalMigrated = 0;
    /*
    Inicializa um contador para armazenar a quantidade total de registros migrados.
    */

    const cursor = oldCollection.find();
    /*
    Cria um cursor para percorrer todos os documentos da coleção antiga.
    Um cursor permite ler os documentos em fluxo, sem carregar tudo na memória de uma vez.
    */

    let batch = [];
    /*
    Declara um array vazio chamado batch, que armazenará documentos temporariamente antes da inserção.
    */

    for await (const doc of cursor) {
    /*
    Percorre todos os documentos da coleção antiga usando um loop assíncrono.
    O uso de await garante que os documentos sejam processados um por um sem bloquear a execução.
    */

      batch.push(doc);
      /*
      Adiciona o documento atual ao lote (batch).
      */

      if (batch.length >= BATCH_SIZE) {
        /*
        Verifica se o tamanho do lote atingiu o limite definido (BATCH_SIZE).
        Se sim, insere os documentos acumulados na nova coleção.
        */

        await newCollection.insertMany(batch);
        /*
        Insere o lote de documentos na nova coleção de forma eficiente.
        */

        totalMigrated += batch.length;
        /*
        Atualiza o contador total de registros migrados.
        */

        console.log(`✅ ${totalMigrated} registros migrados...`);
        /*
        Exibe no console a quantidade de registros migrados até o momento.
        */

        batch = [];
        /*
        Esvazia o array batch para armazenar os próximos documentos.
        */
      }
    }

    if (batch.length > 0) {
      /*
      Se ainda houver documentos não inseridos ao final do loop, insere-os.
      Isso garante que nenhum documento fique para trás.
      */

      await newCollection.insertMany(batch);
      /*
      Insere o lote restante na nova coleção.
      */

      totalMigrated += batch.length;
      /*
      Atualiza o contador total de registros migrados.
      */

      console.log(`✅ ${totalMigrated} registros migrados no total!`);
      /*
      Exibe no console o total de registros migrados.
      */
    }

    console.log("🎉 Migração concluída com sucesso!");
    /*
    Exibe uma mensagem indicando que a migração foi finalizada sem erros.
    */

    res.json({ message: "Migração concluída!", total: totalMigrated });
    /*
    Retorna uma resposta JSON informando o sucesso da migração e o total de registros migrados.
    */

  } catch (error) {
    /*
    Captura e trata qualquer erro que ocorra durante a execução do código dentro do bloco try.
    */

    console.error("❌ Erro na migração:", error);
    /*
    Exibe o erro no console para diagnóstico.
    */

    res.status(500).json({ error: "Erro ao migrar os dados" });
    /*
    Retorna uma resposta HTTP 500 (Erro Interno do Servidor) com uma mensagem de erro em formato JSON.
    */

  } finally {
    /*
    O bloco finally é executado independentemente de sucesso ou erro no try/catch.
    */

    if (clientOld) await clientOld.close();
    /*
    Se o cliente de conexão com o banco antigo foi inicializado, fecha a conexão.
    */

    if (clientNew) await clientNew.close();
    /*
    Se o cliente de conexão com o banco novo foi inicializado, fecha a conexão.
    */

    console.log("🔌 Conexões fechadas.");
    /*
    Exibe no console que as conexões foram fechadas.
    */
  }
}

module.exports = { migrateData };
/*
Exporta a função migrateData para que possa ser utilizada em outros arquivos do projeto.
*/

/*
Resumo do Funcionamento:
1. Conecta-se ao banco de dados antigo e novo.
2. Lê os documentos da coleção antiga usando um cursor.
3. Processa os documentos em lotes (batch) para evitar sobrecarga.
4. Insere os documentos na nova coleção.
5. Exibe logs informando o progresso da migração.
6. Captura erros e os retorna na resposta HTTP.
7. Fecha as conexões ao final do processo.

Benefícios desse código:
Eficiência: Processamento em lotes evita sobrecarga na memória e melhora o desempenho.
Confiabilidade: Tratamento de erros garante que problemas sejam identificados e reportados.
Escalabilidade: Fácil adaptação para migração de grandes volumes de dados.
Segurança: Uso de variáveis de ambiente protege credenciais sensíveis.
Código limpo e modular: Pode ser reutilizado para diferentes migrações no MongoDB.
*/


