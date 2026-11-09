import { useCallback, useEffect, useMemo, useState } from "react";
import { getLatestRiskReport, generateRiskReport } from "../api/riskReport.js";
import { getLatestInventoryAnalysis, generateInventoryAnalysis } from "../api/inventoryAnalysis.js";
import { generatePrediction } from "../api/predict.js";
import { listStores } from "../api/stores.js";
import { listProducts } from "../api/products.js";
import { extractErrorMessage } from "../api/client.js";
import Card from "../components/Card.jsx";
import StatCard from "../components/StatCard.jsx";
import Badge from "../components/Badge.jsx";
import Button from "../components/Button.jsx";
import Select from "../components/Select.jsx";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import Table from "../components/Table.jsx";
import GroupedBarChart from "../components/GroupedBarChart.jsx";
import { formatCurrency, formatDate, formatNumber } from "../utils/format.js";
import { RISK_TONE, RISK_LABEL, RISK_ACTION, INVENTORY_STATUS_TONE, INVENTORY_STATUS_LABEL } from "../utils/risk.js";

const isNotFound = (error) => error?.response?.status === 404;

export default function Dashboard() {
  const [stores, setStores] = useState([]);
  const [storeId, setStoreId] = useState("");
  const [productsById, setProductsById] = useState({});

  const [riskState, setRiskState] = useState({ loading: true, error: null, notFound: false, data: null });
  const [inventoryState, setInventoryState] = useState({ loading: true, error: null, notFound: false, data: null });

  const [generating, setGenerating] = useState(false);
  const [generateStep, setGenerateStep] = useState("");
  const [generateError, setGenerateError] = useState("");

  useEffect(() => {
    listStores({ limit: 100 }).then((res) => setStores(res.stores || [])).catch(() => {});
    listProducts({ limit: 200 })
      .then((res) => {
        const map = {};
        (res.products || []).forEach((p) => {
          map[p._id] = p;
        });
        setProductsById(map);
      })
      .catch(() => {});
  }, []);

  const loadReports = useCallback((selectedStoreId) => {
    setRiskState((s) => ({ ...s, loading: true, error: null, notFound: false }));
    getLatestRiskReport(selectedStoreId || undefined)
      .then((data) => setRiskState({ loading: false, error: null, notFound: false, data }))
      .catch((error) => {
        if (isNotFound(error)) setRiskState({ loading: false, error: null, notFound: true, data: null });
        else setRiskState({ loading: false, error: extractErrorMessage(error), notFound: false, data: null });
      });

    setInventoryState((s) => ({ ...s, loading: true, error: null, notFound: false }));
    getLatestInventoryAnalysis(selectedStoreId || undefined)
      .then((data) => setInventoryState({ loading: false, error: null, notFound: false, data }))
      .catch((error) => {
        if (isNotFound(error)) setInventoryState({ loading: false, error: null, notFound: true, data: null });
        else setInventoryState({ loading: false, error: extractErrorMessage(error), notFound: false, data: null });
      });
  }, []);

  useEffect(() => {
    loadReports(storeId);
  }, [storeId, loadReports]);

  const handleGenerate = async () => {
    setGenerating(true);
    setGenerateError("");
    try {
      setGenerateStep("Running the demand forecast model...");
      await generatePrediction({ storeId: storeId || undefined, forecastDays: 30, modelType: "random_forest" });

      setGenerateStep("Computing discount risk for near-expiry batches...");
      await generateRiskReport(storeId || undefined);

      setGenerateStep("Updating inventory stock analysis...");
      await generateInventoryAnalysis(storeId || undefined);

      loadReports(storeId);
    } catch (error) {
      setGenerateError(extractErrorMessage(error, "Could not generate a new forecast."));
    } finally {
      setGenerating(false);
      setGenerateStep("");
    }
  };

  const wasteAvoidedEstimate = useMemo(() => {
    const batches = riskState.data?.highRiskBatches || [];
    return batches
      .filter((b) => b.riskLevel === "CRITICAL" || b.riskLevel === "CRITICAL_EXPIRED")
      .reduce((sum, b) => sum + b.quantityRemaining * (productsById[b.productId]?.sellingPrice || 0), 0);
  }, [riskState.data, productsById]);

  const chartData = useMemo(() => {
    const statuses = inventoryState.data?.productStatuses || [];
    return statuses.slice(0, 8).map((s) => ({
      label: s.name,
      stock: s.currentStock,
      predicted: s.predictedMonthlySales,
    }));
  }, [inventoryState.data]);

  const highRiskCount = riskState.data?.highRiskItemsCount ?? 0;
  const criticalCount = (riskState.data?.highRiskBatches || []).filter(
    (b) => b.riskLevel === "CRITICAL" || b.riskLevel === "CRITICAL_EXPIRED",
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">What needs action today, at a glance.</p>
        </div>
        <div className="flex items-end gap-3">
          <div className="w-48">
            <Select value={storeId} onChange={(e) => setStoreId(e.target.value)} aria-label="Filter by store">
              <option value="">All stores</option>
              {stores.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <Button onClick={handleGenerate} loading={generating}>
            {generating ? generateStep || "Generating..." : "Run forecast"}
          </Button>
        </div>
      </div>

      {generateError && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger" role="alert">
          {generateError}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="At-risk batches" value={formatNumber(highRiskCount)} tone="warning" />
        <StatCard label="Critical / expiring" value={formatNumber(criticalCount)} tone="danger" />
        <StatCard
          label="Est. waste avoided if acted on"
          value={formatCurrency(wasteAvoidedEstimate)}
          hint="Critical items, full value if discarded"
          tone="success"
        />
        <StatCard
          label="Overstocked products"
          value={formatNumber(inventoryState.data?.overstockedCount ?? 0)}
          tone="neutral"
        />
      </div>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">At-risk products (FEFO order)</h2>
          {riskState.data && <span className="text-xs text-muted">Generated {formatDate(riskState.data.generatedAt)}</span>}
        </div>

        {riskState.loading ? (
          <Spinner label="Loading at-risk items..." />
        ) : riskState.error ? (
          <ErrorState message={riskState.error} onRetry={() => loadReports(storeId)} />
        ) : riskState.notFound || !riskState.data?.highRiskBatches?.length ? (
          <EmptyState
            title="No at-risk items yet"
            description="Upload sales and inventory data, then run a forecast to see which batches need action."
            action={
              <Button variant="secondary" size="sm" onClick={handleGenerate} loading={generating}>
                Run forecast now
              </Button>
            }
          />
        ) : (
          <Table columns={["Product", "Batch", "Qty left", "Expires in", "Risk", "Recommended action"]}>
            {riskState.data.highRiskBatches.map((batch) => (
              <tr key={`${batch.batchId}-${batch.storeId}`}>
                <td className="px-4 py-3 font-medium text-ink">{batch.name}</td>
                <td className="px-4 py-3 text-muted">{batch.batchId}</td>
                <td className="px-4 py-3">{formatNumber(batch.quantityRemaining)}</td>
                <td className="px-4 py-3">
                  {batch.daysToExpire <= 0 ? "Expired" : `${batch.daysToExpire} day${batch.daysToExpire === 1 ? "" : "s"}`}
                </td>
                <td className="px-4 py-3">
                  <Badge tone={RISK_TONE[batch.riskLevel]}>{RISK_LABEL[batch.riskLevel]}</Badge>
                </td>
                <td className="px-4 py-3 text-ink">{RISK_ACTION[batch.riskLevel]}</td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      <Card>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg text-ink">Stock vs predicted monthly demand</h2>
          {inventoryState.data && (
            <span className="text-xs text-muted">Generated {formatDate(inventoryState.data.generatedAt)}</span>
          )}
        </div>

        {inventoryState.loading ? (
          <Spinner label="Loading inventory analysis..." />
        ) : inventoryState.error ? (
          <ErrorState message={inventoryState.error} onRetry={() => loadReports(storeId)} />
        ) : inventoryState.notFound || !chartData.length ? (
          <EmptyState title="No inventory analysis yet" description="Run a forecast to compare stock levels against predicted demand." />
        ) : (
          <>
            <GroupedBarChart
              data={chartData}
              seriesA={{ key: "stock", label: "Current stock", color: "#111111" }}
              seriesB={{ key: "predicted", label: "Predicted monthly demand", color: "#3b82f6" }}
            />
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {(inventoryState.data.productStatuses || []).slice(0, 8).map((p) => (
                <div key={p.productId} className="flex items-center justify-between rounded-md bg-surface-soft px-3 py-2">
                  <span className="truncate text-xs font-medium text-ink">{p.name}</span>
                  <Badge tone={INVENTORY_STATUS_TONE[p.status]}>{INVENTORY_STATUS_LABEL[p.status]}</Badge>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
