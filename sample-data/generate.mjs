// One-off generator for demo sample data. Not part of the app - run manually:
//   node sample-data/generate.mjs
// Produces sample-data/inventory.csv and sample-data/sales.csv to go with the
// already-written stores.csv and products.csv.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.dirname(fileURLToPath(import.meta.url));
const today = new Date();
today.setHours(0, 0, 0, 0);

const fmt = (d) => d.toISOString().slice(0, 10);
const addDays = (d, n) => {
  const copy = new Date(d);
  copy.setDate(copy.getDate() + n);
  return copy;
};

// profile: velocity = avg units sold/day, salesHistoryDays = how many days of sales to generate,
// batchAQty/batchAAgeDays = the older, near-expiry batch, batchBQty = a fresh second batch.
// riskyLeftover=true keeps total sales below batchA's qty so stock survives to show up as at-risk.
const PRODUCTS = [
  // sku,        shelfLife, velocity, historyDays, batchAQty, batchAAgeDays, batchBQty, riskyLeftover
  ["MILK-001", 5, 3, 24, 55, 4, 110, true], // slow mover, near-expiry stock left over -> CRITICAL
  ["BRD-001", 4, 4, 24, 48, 3, 90, true], // near-expiry, moderate leftover -> HIGH/CRITICAL
  ["YOG-001", 7, 10, 30, 60, 5, 150, false], // fast mover, consumes old batch fully -> LOW risk
  ["PNR-001", 4, 2, 20, 40, 3, 60, true], // very slow, near-expiry -> CRITICAL_EXPIRED range
  ["TOM-001", 6, 18, 30, 70, 4, 160, false], // fast mover, healthy turnover -> LOW risk
  ["SPN-001", 3, 2, 14, 30, 2, 40, true], // short shelf life + slow -> CRITICAL
  ["BAN-001", 5, 25, 30, 90, 3, 220, false], // high velocity, UNDERSTOCKED candidate
  ["EGG-001", 10, 6, 35, 80, 6, 160, false], // steady mover, ADEQUATE
  ["BUT-001", 20, 1, 40, 150, 10, 150, false], // very slow, long shelf life -> OVERSTOCKED
  ["CRT-001", 8, 15, 30, 95, 4, 180, false], // good mover -> ADEQUATE
];

const STORES = ["ST-001", "ST-002"];

const inventoryRows = [
  "batch_id,sku,store_code,quantity_current,quantity_received,expiry_date,received_date",
];
const salesRows = ["sku,store_code,quantity_sold,date,revenue,discount_applied"];

// Selling price lookup matches products.csv (cost/selling used only for revenue realism)
const PRICE = {
  "MILK-001": 42,
  "BRD-001": 38,
  "YOG-001": 35,
  "PNR-001": 60,
  "TOM-001": 30,
  "SPN-001": 22,
  "BAN-001": 26,
  "EGG-001": 90,
  "BUT-001": 58,
  "CRT-001": 24,
};

let batchCounter = 1;

for (const storeCode of STORES) {
  // Store 2 gets a lighter subset to demo multi-store filtering without doubling the dataset.
  const products = storeCode === "ST-001" ? PRODUCTS : PRODUCTS.slice(0, 4);

  for (const [
    sku,
    shelfLife,
    velocity,
    historyDays,
    batchAQty,
    batchAAgeDays,
    batchBQty,
    riskyLeftover,
  ] of products) {
    const receivedA = addDays(today, -batchAAgeDays);
    const expiryA = addDays(receivedA, shelfLife);
    const receivedB = today;
    const expiryB = addDays(receivedB, shelfLife);

    const batchIdA = `BATCH-${String(batchCounter++).padStart(4, "0")}`;
    const batchIdB = `BATCH-${String(batchCounter++).padStart(4, "0")}`;

    inventoryRows.push(
      `${batchIdA},${sku},${storeCode},${batchAQty},${batchAQty},${fmt(expiryA)},${fmt(receivedA)}`,
    );
    inventoryRows.push(
      `${batchIdB},${sku},${storeCode},${batchBQty},${batchBQty},${fmt(expiryB)},${fmt(receivedB)}`,
    );

    // Keep total sold safely under batchAQty when we want leftover near-expiry stock,
    // otherwise let it exceed batchA so FIFO dips into the fresh batch (healthy turnover).
    const targetTotal = riskyLeftover
      ? Math.floor(batchAQty * 0.55)
      : Math.floor((batchAQty + batchBQty) * 0.35);
    const avgPerDay = Math.max(1, Math.round(targetTotal / historyDays));

    let totalSold = 0;
    for (let i = historyDays; i >= 1; i -= 1) {
      const date = addDays(today, -i);
      const jitter = Math.round((Math.sin(i * 1.7 + sku.length) + 1) * (avgPerDay * 0.4));
      const qty = Math.max(0, avgPerDay + jitter - Math.round(avgPerDay * 0.4));
      if (qty === 0) continue;
      totalSold += qty;
      const revenue = (qty * PRICE[sku]).toFixed(2);
      salesRows.push(`${sku},${storeCode},${qty},${fmt(date)},${revenue},0`);
    }
  }
}

// A deliberately malformed row (negative quantity) to exercise the "skipped rows with
// reasons" reporting - this one fails format validation so it's dropped per-row, not
// a referential error, so it won't abort the rest of the batch.
inventoryRows.push("BATCH-BAD-1,MILK-001,ST-001,-5,10,2026-12-01,2026-11-01");
salesRows.push("MILK-001,ST-001,0,2026-11-01,10,0");

fs.writeFileSync(path.join(dir, "inventory.csv"), inventoryRows.join("\n") + "\n");
fs.writeFileSync(path.join(dir, "sales.csv"), salesRows.join("\n") + "\n");

// Separate tiny file with a referential error (unknown SKU) kept isolated from the main
// seed - uploading the main inventory.csv first, then this one, demonstrates both failure
// modes without risking the demo dataset (an unknown SKU/store aborts its whole batch,
// see BACKEND_CHANGES.md "Issues found but not fixed").
fs.writeFileSync(
  path.join(dir, "inventory-with-unknown-sku.csv"),
  [
    "batch_id,sku,store_code,quantity_current,quantity_received,expiry_date,received_date",
    "BATCH-BAD-2,UNKNOWN-SKU,ST-001,10,10,2026-12-01,2026-11-01",
  ].join("\n") + "\n",
);

console.log(`Wrote ${inventoryRows.length - 1} inventory rows, ${salesRows.length - 1} sales rows.`);
