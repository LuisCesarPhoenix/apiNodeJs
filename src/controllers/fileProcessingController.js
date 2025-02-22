const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");

function sanitizeData(row) {
  const sanitizedRow = {};
  for (const key in row) {
    if (Object.hasOwnProperty.call(row, key)) {
      sanitizedRow[key] = row[key].trim().replace(/\s+/g, " ");
    }
  }
  return sanitizedRow;
}

async function processFiles(req, res) {
  try {
    const { files } = req.body;
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({ error: "Lista de arquivos inválida." });
    }

    const results = [];

    for (const filename of files) {
      const inputPath = path.join(__dirname, "../../storage/work", filename);
      const tempPath = path.join(__dirname, "../../storage/temporario", filename);
      const finalPath = path.join(__dirname, "../../storage/finalizado", filename);

      if (!fs.existsSync(inputPath)) {
        results.push({ filename, status: "Erro: Arquivo não encontrado." });
        continue;
      }

      const writeStream = fs.createWriteStream(tempPath);
      let batch = [];
      const BATCH_SIZE = 1000;

      await new Promise((resolve, reject) => {
        fs.createReadStream(inputPath)
          .pipe(csv())
          .on("data", (row) => {
            batch.push(sanitizeData(row));
            if (batch.length === BATCH_SIZE) {
              writeStream.write(batch.map((r) => Object.values(r).join(",")).join("\n") + "\n");
              batch = [];
            }
          })
          .on("end", () => {
            if (batch.length > 0) {
              writeStream.write(batch.map((r) => Object.values(r).join(",")).join("\n") + "\n");
            }
            writeStream.end();
            fs.renameSync(tempPath, finalPath);
            results.push({ filename, status: "Processado com sucesso." });
            resolve();
          })
          .on("error", (error) => {
            console.error("Erro no processamento:", error);
            results.push({ filename, status: "Erro no processamento." });
            reject(error);
          });
      });
    }

    res.json({ results });
  } catch (error) {
    console.error("Erro na rota:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
}

module.exports = { processFiles };
