"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth/AuthContext";
import { useSalon } from "@/lib/salon/SalonContext";
import {
  addService,
  deleteService,
  listAllServices,
  setServiceActive,
  updateService,
} from "@/lib/queries/services";
import type { Service, ServiceInput } from "@/types/models";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { formatPrice } from "@/lib/format";

export default function ServicesPage() {
  const { user } = useAuth();
  const { salon } = useSalon();
  const [services, setServices] = useState<Service[] | null>(null);
  // Bumped after every mutation to re-run the effect below and refetch,
  // without the effect ever calling a function that itself sets state.
  const [reloadToken, setReloadToken] = useState(0);
  const reload = useCallback(() => setReloadToken((t) => t + 1), []);

  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    user
      .getIdToken()
      .then((token) => listAllServices(token, salon.id))
      .then((result) => {
        if (!cancelled) setServices(result);
      });
    return () => {
      cancelled = true;
    };
  }, [user, salon.id, reloadToken]);

  const loading = services === null;
  const list = services ?? [];
  const nextSortOrder = list.length ? Math.max(...list.map((s) => s.sortOrder)) + 1 : 0;

  async function handleAdd(input: ServiceInput) {
    if (!user) return;
    const token = await user.getIdToken();
    await addService(token, salon.id, input);
    setAdding(false);
    reload();
  }

  async function handleEdit(serviceId: string, input: ServiceInput) {
    if (!user) return;
    const token = await user.getIdToken();
    await updateService(token, salon.id, serviceId, input);
    setEditingId(null);
    reload();
  }

  async function handleToggleActive(service: Service, active: boolean) {
    if (!user) return;
    const token = await user.getIdToken();
    await setServiceActive(token, salon.id, service.id, active);
    reload();
  }

  async function handleDelete(service: Service) {
    if (!user) return;
    if (!confirm(`Delete "${service.name}"? This can't be undone.`)) return;
    const token = await user.getIdToken();
    await deleteService(token, salon.id, service.id);
    reload();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Services</h1>
        {!adding ? (
          <button
            onClick={() => setAdding(true)}
            className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            + Add service
          </button>
        ) : null}
      </div>

      {adding ? (
        <ServiceForm
          salonId={salon.id}
          nextSortOrder={nextSortOrder}
          onSubmit={handleAdd}
          onCancel={() => setAdding(false)}
        />
      ) : null}

      {loading ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : list.length === 0 && !adding ? (
        <p className="text-sm text-zinc-500">No services yet. Add your first one above.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {list.map((service) =>
            editingId === service.id ? (
              <ServiceForm
                key={service.id}
                salonId={salon.id}
                initial={service}
                nextSortOrder={nextSortOrder}
                onSubmit={(input) => handleEdit(service.id, input)}
                onCancel={() => setEditingId(null)}
              />
            ) : (
              <li
                key={service.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
              >
                <div>
                  <p className="font-medium">
                    {service.name}{" "}
                    <span className="font-normal text-zinc-400">· {service.category}</span>
                  </p>
                  <p className="text-sm text-zinc-500">{formatPrice(service.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                    <input
                      type="checkbox"
                      checked={service.active}
                      onChange={(e) => handleToggleActive(service, e.target.checked)}
                    />
                    Active
                  </label>
                  <button
                    onClick={() => setEditingId(service.id)}
                    className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(service)}
                    className="text-sm font-medium text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}
