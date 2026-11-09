import { useState } from "react";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import FileDropzone from "../components/FileDropzone.jsx";
import { extractErrorMessage } from "../api/client.js";
import { uploadStoresCsv } from "../api/stores.js";
import { uploadProductsCsv } from "../api/products.js";
import { uploadInventoryCsv } from "../api/inventory.js";
import { uploadSalesCsv } from "../api/sales.js";

const TABS = [
  {
    key: "stores",
    label: "Stores",
    upload: uploadStoresCsv,
    columns: "store_code, name, location",
  },
  {
    key: "products",
    label: "Products",
    upload: uploadProductsCsv,
    columns: "sku, name, category, cost_price, selling_price, unit, shelf_life",
  },
  {
    key: "inventory",
    label: "Inventory batches",
    upload: uploadInventoryCsv,
    columns: "batch_id, sku, store_code, quantity_current, quantity_received, expiry_date, received_date",
  },
  {
    key: "sales",
    label: "Sales",
    upload: uploadSalesCsv,
    columns: "sku, store_code, quantity_sold, date, revenue, discount_applied",
  },
];

function UploadPanel({ tab }) {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    setResult(null);
    setProgress(0);
    try {
      const response = await tab.upload(file, setProgress);
      setResult(response);
      setFile(null);
    } catch (err) {
      setError(extractErrorMessage(err, "Upload failed."));
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <p className="mb-4 text-sm text-muted">
        Expected columns: <code className="rounded bg-surface-card px-1.5 py-0.5 text-xs">{tab.columns}</code>
      </p>

      <FileDropzone onFileSelected={setFile} disabled={uploading} selectedFileName={file?.name} />

      {uploading && (
        <div className="mt-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-card">
            <div className="h-full bg-ink transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-1.5 text-xs text-muted">Uploading... {progress}%</p>
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <Button onClick={handleUpload} disabled={!file} loading={uploading}>
          Upload {tab.label.toLowerCase()}
        </Button>
      </div>

      {error && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {result && (
        <div className="mt-5 rounded-md border border-hairline p-4">
          <div className="flex flex-wrap gap-6 text-sm">
            <span className="text-ink">
              <strong className="font-semibold">{result.totalProcessed}</strong> rows imported
            </span>
            <span className={result.totalSkipped > 0 ? "text-amber-700" : "text-muted"}>
              <strong className="font-semibold">{result.totalSkipped}</strong> rows skipped
            </span>
          </div>

          {result.skippedRows?.length > 0 && (
            <div className="mt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">Why rows were skipped</p>
              <div className="max-h-56 overflow-y-auto rounded-md border border-hairline-soft">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-soft">
                    <tr>
                      <th className="px-3 py-2 font-medium text-muted">Row</th>
                      <th className="px-3 py-2 font-medium text-muted">Reason</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-hairline-soft">
                    {result.skippedRows.map((row) => (
                      <tr key={row.row}>
                        <td className="px-3 py-2 text-ink">#{row.row}</td>
                        <td className="px-3 py-2 text-muted">{row.errors.join(", ")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {result.skippedRowsTruncated && (
                <p className="mt-2 text-xs text-muted-soft">Showing the first 50 skipped rows.</p>
              )}
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

export default function UploadCsv() {
  const [activeTab, setActiveTab] = useState(TABS[0].key);
  const tab = TABS.find((t) => t.key === activeTab);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Upload data</h1>
        <p className="mt-1 text-sm text-muted">
          Upload stores and products first, then inventory batches and sales - later uploads reference the SKUs and
          store codes already on file.
        </p>
      </div>

      <div className="flex gap-1 rounded-full bg-surface-soft p-1.5 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === t.key ? "bg-canvas text-ink shadow-soft" : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <UploadPanel key={tab.key} tab={tab} />
    </div>
  );
}
