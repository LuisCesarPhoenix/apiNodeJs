const express = require("express");
const fs = require("fs");
const path = require("path");
const csv = require("csv-parser");
const { processFiles } = require("../controllers/fileProcessingController");

const router = express.Router();

// Rota para processar múltiplos arquivos
router.post("/process", processFiles);

// Função de higienização
function sanitizeData(row) {
  const sanitizedRow = {};
  for (const key in row) {
    if (row.hasOwnProperty(key)) {
      sanitizedRow[key] = row[key].trim().replace(/\s+/g, " ");
    }
  }
  return sanitizedRow;
}

// Rota para processar um único arquivo
router.post("/process/:filename", async (req, res) => {
  try {
    const { filename } = req.params;
    const inputPath = path.resolve(__dirname, "..", "..", "storage", "work", filename);
    const tempPath = path.resolve(__dirname, "..", "..", "storage", "temporario", filename);
    const finalPath = path.resolve(__dirname, "..", "..", "storage", "finalizado", filename);

    if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ error: "Arquivo não encontrado." });
    }

    const writeStream = fs.createWriteStream(tempPath);
    let batch = [];
    const BATCH_SIZE = 1000;

    fs.createReadStream(inputPath)
      .pipe(csv())
      .on("data", (row) => {
        batch.push(sanitizeData(row));
        if (batch.length === BATCH_SIZE) {
          writeStream.write(batch.map((r) => Object.values(r).join(",")).join("\n") + "\n");
          batch = [];
        }
      })
      .on("end", async () => {
        if (batch.length > 0) {
          writeStream.write(batch.map((r) => Object.values(r).join(",")).join("\n") + "\n");
        }
        writeStream.end();

        // Usando fs.rename para evitar bloqueio síncrono
        fs.rename(tempPath, finalPath, (err) => {
          if (err) {
            console.error("Erro ao mover o arquivo:", err);
            return res.status(500).json({ error: "Erro ao finalizar o processamento." });
          }
          res.json({ message: `Arquivo ${filename} processado com sucesso.` });
        });
      })
      .on("error", (error) => {
        console.error("Erro no processamento:", error);
        res.status(500).json({ error: "Erro ao processar o arquivo." });
      });

  } catch (error) {
    console.error("Erro na rota:", error);
    res.status(500).json({ error: "Erro interno do servidor." });
  }
});

module.exports = router;
