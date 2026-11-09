import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { listProducts, createProduct, updateProduct, deleteProduct } from "../api/products.js";
import { extractErrorMessage } from "../api/client.js";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Select from "../components/Select.jsx";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";
import { formatCurrency } from "../utils/format.js";

const UNITS = ["pcs", "kg", "g", "pack"];

function ProductForm({ initialValues, onSubmit, onCancel, submitting, serverError }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <Input label="SKU" error={errors.sku?.message} {...register("sku", { required: "Required" })} />
        <Input label="Name" error={errors.name?.message} {...register("name", { required: "Required" })} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Input label="Category" error={errors.category?.message} {...register("category", { required: "Required" })} />
        <Select label="Unit" error={errors.unit?.message} {...register("unit", { required: "Required" })}>
          {UNITS.map((u) => (
            <option key={u} value={u}>
              {u}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Cost price"
          type="number"
          step="0.01"
          error={errors.costPrice?.message}
          {...register("costPrice", { required: "Required", valueAsNumber: true, min: 0 })}
        />
        <Input
          label="Selling price"
          type="number"
          step="0.01"
          error={errors.sellingPrice?.message}
          {...register("sellingPrice", { required: "Required", valueAsNumber: true, min: 0 })}
        />
        <Input
          label="Shelf life (days)"
          type="number"
          error={errors.shelfLife?.message}
          {...register("shelfLife", { required: "Required", valueAsNumber: true, min: 1 })}
        />
      </div>

      {serverError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save product
        </Button>
      </div>
    </form>
  );
}

export default function Products() {
  const [state, setState] = useState({ loading: true, error: null, products: [] });
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [modal, setModal] = useState(null); // { mode: 'create' | 'edit', product? }
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    listProducts({ limit: 200, sortField: "name" })
      .then((res) => setState({ loading: false, error: null, products: res.products || [] }))
      .catch((error) => setState({ loading: false, error: extractErrorMessage(error), products: [] }));
  };

  useEffect(load, []);

  const categories = useMemo(
    () => [...new Set(state.products.map((p) => p.category))].sort(),
    [state.products],
  );

  const filtered = useMemo(() => {
    return state.products.filter((p) => {
      const matchesSearch =
        !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !category || p.category === category;
      return matchesSearch && matchesCategory;
    });
  }, [state.products, search, category]);

  const handleCreate = async (values) => {
    setSubmitting(true);
    setFormError("");
    try {
      await createProduct(values);
      setModal(null);
      load();
    } catch (error) {
      setFormError(extractErrorMessage(error, "Could not save product."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (values) => {
    setSubmitting(true);
    setFormError("");
    try {
      await updateProduct(modal.product._id, values);
      setModal(null);
      load();
    } catch (error) {
      setFormError(extractErrorMessage(error, "Could not update product."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (product) => {
    if (!window.confirm(`Delete ${product.name}? This cannot be undone.`)) return;
    try {
      await deleteProduct(product._id);
      load();
    } catch (error) {
      window.alert(extractErrorMessage(error, "Could not delete product."));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Products</h1>
          <p className="mt-1 text-sm text-muted">{filtered.length} of {state.products.length} products</p>
        </div>
        <Button onClick={() => { setFormError(""); setModal({ mode: "create" }); }}>Add product</Button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Input placeholder="Search by name or SKU" value={search} onChange={(e) => setSearch(e.target.value)} className="sm:max-w-xs" />
        <Select value={category} onChange={(e) => setCategory(e.target.value)} className="sm:max-w-xs">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </div>

      <Card className="p-0">
        {state.loading ? (
          <Spinner label="Loading products..." />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={load} />
        ) : filtered.length === 0 ? (
          <EmptyState title="No products found" description="Upload a product CSV or add one manually to get started." />
        ) : (
          <Table columns={["SKU", "Name", "Category", "Unit", "Cost", "Selling price", "Shelf life", ""]}>
            {filtered.map((p) => (
              <tr key={p._id}>
                <td className="px-4 py-3 font-mono text-xs text-muted">{p.sku}</td>
                <td className="px-4 py-3 font-medium text-ink">{p.name}</td>
                <td className="px-4 py-3 text-muted">{p.category}</td>
                <td className="px-4 py-3 text-muted">{p.unit}</td>
                <td className="px-4 py-3">{formatCurrency(p.costPrice)}</td>
                <td className="px-4 py-3">{formatCurrency(p.sellingPrice)}</td>
                <td className="px-4 py-3">{p.shelfLife}d</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="text-xs font-medium text-ink underline"
                      onClick={() => { setFormError(""); setModal({ mode: "edit", product: p }); }}
                    >
                      Edit
                    </button>
                    <button className="text-xs font-medium text-danger underline" onClick={() => handleDelete(p)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>

      {modal && (
        <Modal title={modal.mode === "create" ? "Add product" : "Edit product"} onClose={() => setModal(null)}>
          <ProductForm
            initialValues={
              modal.mode === "edit"
                ? modal.product
                : { sku: "", name: "", category: "", unit: "pcs", costPrice: 0, sellingPrice: 0, shelfLife: 7 }
            }
            onSubmit={modal.mode === "create" ? handleCreate : handleUpdate}
            onCancel={() => setModal(null)}
            submitting={submitting}
            serverError={formError}
          />
        </Modal>
      )}
    </div>
  );
}
