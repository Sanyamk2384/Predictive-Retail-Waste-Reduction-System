import { Readable } from "node:stream";
import csv from "csv-parser";
import { validateSalesRow } from "../validations/salesValidator.js";
import { validateInventoryRow } from "../validations/inventoryValidator.js";
import { validateStoreRow } from "../validations/storeValidator.js";
import { validateProductRow } from "../validations/productValidator.js";

const BATCH_SIZE = 1000;
const MAX_REPORTED_SKIPPED_ROWS = 50;

const parseCsv = async (fileBuffer, validator, onBatchParsed, mapData = (data) => data) => {
  const source = Readable.from(fileBuffer);
  const parser = source.pipe(csv());
  source.on("error", (error) => parser.destroy(error));

  let totalProcessed = 0;
  let totalSkipped = 0;
  let rowNumber = 0;
  const skippedRows = [];
  let batchRecords = [];

  try {
    for await (const rawRow of parser) {
      rowNumber += 1;
      const validation = validator(rawRow);
      if (!validation.isValid) {
        totalSkipped += 1;
        if (skippedRows.length < MAX_REPORTED_SKIPPED_ROWS) {
          skippedRows.push({ row: rowNumber, errors: validation.errors });
        }
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

    return {
      totalProcessed,
      totalSkipped,
      skippedRows,
      skippedRowsTruncated: totalSkipped > skippedRows.length,
    };
  } catch (error) {
    source.destroy();
    parser.destroy();
    throw error;
  }
};

export const parseSalesCsv = (fileBuffer, batchId, onBatchParsed) =>
  parseCsv(fileBuffer, validateSalesRow, onBatchParsed, (data) => ({
    ...data,
    batchId,
  }));

export const parseInventoryCsv = (fileBuffer, onBatchParsed) =>
  parseCsv(fileBuffer, validateInventoryRow, onBatchParsed);

export const parseStoreData = (fileBuffer, onBatchParsed) =>
  parseCsv(fileBuffer, validateStoreRow, onBatchParsed);

export const parseProductData = (fileBuffer, onBatchParsed) =>
  parseCsv(fileBuffer, validateProductRow, onBatchParsed);
