// src/controllers/migrationController.js (Migração com conexão sob demanda)
// A conexão é aberta apenas na migração e fechada no final
const { connectMongoDB } = require("../config/mongoConfig");
require("dotenv").config();

const COLLECTION_OLD = process.env.MONGO_COLLECTION_OLD; // Origem
const COLLECTION_NEW = process.env.MONGO_COLLECTION_NEW; // Destino
const BATCH_SIZE = parseInt(process.env.BATCH_SIZE, 10) || 1000;

async function migrateData(req, res) {
  let clientOld, clientNew;

  try {
    console.log(`🔄 Iniciando migração da coleção "${COLLECTION_OLD}" para "${COLLECTION_NEW}"...`);

    // Conectando ao MongoDB remoto (origem)
    const oldDB = await connectMongoDB(process.env.MONGO_URI_OLD, process.env.MONGO_DB_OLD);
    clientOld = oldDB.client;
    const oldCollection = oldDB.db.collection(COLLECTION_OLD);

    // Conectando ao MongoDB local (destino)
    const newDB = await connectMongoDB(process.env.MONGO_URI_NEW, process.env.MONGO_DB_NEW);
    clientNew = newDB.client;
    const newCollection = newDB.db.collection(COLLECTION_NEW);

    let totalMigrated = 0;
    const cursor = oldCollection.find(); // Criando cursor para leitura eficiente
    let batch = [];

    for await (const doc of cursor) {
      batch.push(doc);

      if (batch.length >= BATCH_SIZE) {
        await newCollection.insertMany(batch);
        totalMigrated += batch.length;
        console.log(`✅ ${totalMigrated} registros migrados...`);
        batch = []; // Esvaziar o batch para o próximo lote
      }
    }

    // Inserir os últimos registros (se houver menos de BATCH_SIZE no final)
    if (batch.length > 0) {
      await newCollection.insertMany(batch);
      totalMigrated += batch.length;
      console.log(`✅ ${totalMigrated} registros migrados no total!`);
    }

    console.log("🎉 Migração concluída com sucesso!");
    res.json({ message: "Migração concluída!", total: totalMigrated });

  } catch (error) {
    console.error("❌ Erro na migração:", error);
    res.status(500).json({ error: "Erro ao migrar os dados" });
  } finally {
    // Fechar conexões após a operação
    if (clientOld) await clientOld.close();
    if (clientNew) await clientNew.close();
    console.log("🔌 Conexões fechadas.");
  }
}

module.exports = { migrateData };

