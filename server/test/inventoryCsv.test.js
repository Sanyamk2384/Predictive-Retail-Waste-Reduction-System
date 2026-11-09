import assert from "node:assert/strict";
import test from "node:test";
import { parseSalesCsv } from "../src/utils/csvParser.js";
import { validateInventoryRow } from "../src/validations/inventoryValidator.js";
import { validateProductRow } from "../src/validations/productValidator.js";
import { validateStoreRow } from "../src/validations/storeValidator.js";
import { validateSalesRow } from "../src/validations/salesValidator.js";
import { allocateFifoStock } from "../src/services/salesService.js";

test("CSV row validators treat SKU/store codes as strings and reject invalid quantities", () => {
  const inventory = validateInventoryRow({
    batch_id: "B-1",
    sku: "SKU-1",
    store_code: "STORE-1",
    quantity_current: "4",
    quantity_received: "5",
    expiry_date: "2027-01-01",
    received_date: "2026-01-01",
  });
  assert.equal(inventory.isValid, true);
  assert.equal(inventory.data.sku, "SKU-1");

  assert.equal(
    validateInventoryRow({
      batch_id: "B-1",
      sku: "SKU-1",
      store_code: "STORE-1",
      quantity_current: "1.5",
      quantity_received: "2",
      expiry_date: "2027-01-01",
      received_date: "2026-01-01",
    }).isValid,
    false,
  );
  assert.equal(
    validateProductRow({
      sku: "SKU-1",
      name: "Product",
      category: "Food",
      cost_price: "1",
      selling_price: "2",
      unit: "pcs",
      shelf_life: "2.5",
    }).isValid,
    false,
  );
  assert.equal(validateStoreRow({ store_code: "STORE-1", name: "One", location: "Town" }).isValid, true);
  assert.equal(
    validateSalesRow({
      sku: "SKU-1",
      store_code: "STORE-1",
      quantity_sold: "0",
      date: "2026-01-01",
      revenue: "2.50",
      discount_applied: "0",
    }).isValid,
    false,
  );
});

test("CSV batch parser awaits persistence and propagates callback failures", async () => {
  const fileBuffer = Buffer.from(
    [
      "sku,store_code,quantity_sold,date,revenue,discount_applied",
      "SKU-1,STORE-1,2,2026-01-01,3.50,5",
      "SKU-2,STORE-1,1,2026-01-02,2,",
      "SKU-3,STORE-1,0,2026-01-03,1,0",
    ].join("\n"),
  );

  let activeCallbacks = 0;
  let maxActiveCallbacks = 0;
  const saved = [];
  const result = await parseSalesCsv(fileBuffer, "batch-1", async (records) => {
    activeCallbacks += 1;
    maxActiveCallbacks = Math.max(maxActiveCallbacks, activeCallbacks);
    await new Promise((resolve) => setTimeout(resolve, 5));
    saved.push(...records);
    activeCallbacks -= 1;
  });
  assert.equal(result.totalProcessed, 2);
  assert.equal(result.totalSkipped, 1);
  assert.deepEqual(result.skippedRows, [{ row: 3, errors: ["Invalid quantity_sold"] }]);
  assert.equal(maxActiveCallbacks, 1);
  assert.equal(saved[0].batchId, "batch-1");
  assert.equal(saved[0].totalAmount, 3.5);

  await assert.rejects(
    parseSalesCsv(fileBuffer, "batch-2", async () => {
      throw new Error("persistence failed");
    }),
    /persistence failed/,
  );
});

test("FIFO allocation consumes older stock first and keeps cumulative deductions", () => {
  const batches = [
    { id: "old", remaining: 3 },
    { id: "new", remaining: 5 },
  ];
  const deductions = new Map();
  assert.equal(allocateFifoStock(batches, 4, deductions), 0);
  assert.equal(allocateFifoStock(batches, 3, deductions), 0);
  assert.deepEqual([...deductions.values()].map(({ id, quantity }) => [id, quantity]), [
    ["old", 3],
    ["new", 4],
  ]);
  assert.equal(allocateFifoStock(batches, 2, deductions), 1);
});
