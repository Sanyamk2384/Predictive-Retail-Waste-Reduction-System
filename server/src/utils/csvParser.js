import fs from "node:fs";
import csv from "csv-parser";
import { validateSalesRow } from "../validations/salesValidator.js";
import { validateInventoryRow } from "../validations/inventoryValidator.js";
import { validateStoreRow } from "../validations/storeValidator.js";
import { validateProductRow } from "../validations/productValidator.js";

const BATCH_SIZE = 1000;

const parseCsv = async (filePath, validator, onBatchParsed, mapData = (data) => data) => {
  const source = fs.createReadStream(filePath);
  const parser = source.pipe(csv());
  source.on("error", (error) => parser.destroy(error));

  let totalProcessed = 0;
  let totalSkipped = 0;
  let batchRecords = [];

  try {
    for await (const rawRow of parser) {
      const validation = validator(rawRow);
      if (!validation.isValid) {
        totalSkipped += 1;
        continue;
      }

      batchRecords.push(mapData(validation.data));
      if (batchRecords.length === BATCH_SIZE) {
        await onBatchParsed(batchRecords);
        totalProcessed += batchRecords.length;
        batchRecords = [];
      }
    }

    if (batchRecords.length > 0) {
      await onBatchParsed(batchRecords);
      totalProcessed += batchRecords.length;
    }

    return { totalProcessed, totalSkipped };
  } catch (error) {
    source.destroy();
    parser.destroy();
    throw error;
  }
};

export const parseSalesCsv = (filePath, batchId, onBatchParsed) =>
  parseCsv(filePath, validateSalesRow, onBatchParsed, (data) => ({
    ...data,
    batchId,
  }));

export const parseInventoryCsv = (filePath, onBatchParsed) =>
  parseCsv(filePath, validateInventoryRow, onBatchParsed);

export const parseStoreData = (filePath, onBatchParsed) =>
  parseCsv(filePath, validateStoreRow, onBatchParsed);

export const parseProductData = (filePath, onBatchParsed) =>
  parseCsv(filePath, validateProductRow, onBatchParsed);
