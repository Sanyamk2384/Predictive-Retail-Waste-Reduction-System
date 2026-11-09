import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { listStores, createStore, updateStore, deleteStore } from "../api/stores.js";
import { extractErrorMessage } from "../api/client.js";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import Input from "../components/Input.jsx";
import Table from "../components/Table.jsx";
import Modal from "../components/Modal.jsx";
import Spinner from "../components/Spinner.jsx";
import EmptyState from "../components/EmptyState.jsx";
import ErrorState from "../components/ErrorState.jsx";

function StoreForm({ initialValues, onSubmit, onCancel, submitting, serverError }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: initialValues });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Store code" error={errors.storeCode?.message} {...register("storeCode", { required: "Required" })} />
      <Input label="Name" error={errors.name?.message} {...register("name", { required: "Required" })} />
      <Input label="Location" error={errors.location?.message} {...register("location", { required: "Required" })} />

      {serverError && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-danger">{serverError}</p>}

      <div className="mt-2 flex justify-end gap-3">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={submitting}>
          Save store
        </Button>
      </div>
    </form>
  );
}

export default function Stores() {
  const [state, setState] = useState({ loading: true, error: null, stores: [] });
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const load = () => {
    setState((s) => ({ ...s, loading: true, error: null }));
    listStores({ limit: 100 })
      .then((res) => setState({ loading: false, error: null, stores: res.stores || [] }))
      .catch((error) => setState({ loading: false, error: extractErrorMessage(error), stores: [] }));
  };

  useEffect(load, []);

  const handleCreate = async (values) => {
    setSubmitting(true);
    setFormError("");
    try {
      await createStore(values);
      setModal(null);
      load();
    } catch (error) {
      setFormError(extractErrorMessage(error, "Could not save store."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (values) => {
    setSubmitting(true);
    setFormError("");
    try {
      await updateStore(modal.store._id, values);
      setModal(null);
      load();
    } catch (error) {
      setFormError(extractErrorMessage(error, "Could not update store."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (store) => {
    if (!window.confirm(`Delete ${store.name}? This cannot be undone.`)) return;
    try {
      await deleteStore(store._id);
      load();
    } catch (error) {
      window.alert(extractErrorMessage(error, "Could not delete store."));
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">Stores</h1>
          <p className="mt-1 text-sm text-muted">{state.stores.length} stores on file</p>
        </div>
        <Button onClick={() => { setFormError(""); setModal({ mode: "create" }); }}>Add store</Button>
      </div>

      <Card className="p-0">
        {state.loading ? (
          <Spinner label="Loading stores..." />
        ) : state.error ? (
          <ErrorState message={state.error} onRetry={load} />
        ) : state.stores.length === 0 ? (
          <EmptyState title="No stores found" description="Upload a store CSV or add one manually." />
        ) : (
          <Table columns={["Store code", "Name", "Location", ""]}>
            {state.stores.map((s) => (
              <tr key={s._id}>
                <td className="px-4 py-3 font-mono text-xs text-muted">{s.storeCode}</td>
                <td className="px-4 py-3 font-medium text-ink">{s.name}</td>
                <td className="px-4 py-3 text-muted">{s.location}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      className="text-xs font-medium text-ink underline"
                      onClick={() => { setFormError(""); setModal({ mode: "edit", store: s }); }}
                    >
                      Edit
                    </button>
                    <button className="text-xs font-medium text-danger underline" onClick={() => handleDelete(s)}>
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
        <Modal title={modal.mode === "create" ? "Add store" : "Edit store"} onClose={() => setModal(null)}>
          <StoreForm
            initialValues={modal.mode === "edit" ? modal.store : { storeCode: "", name: "", location: "" }}
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
