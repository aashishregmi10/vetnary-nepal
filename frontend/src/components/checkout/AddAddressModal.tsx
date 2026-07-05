"use client";

import { useState } from "react";
import { X, MapPin, Home } from "lucide-react";
import { clientApi, ClientApiError } from "@/lib/client-api";
import { PROVINCES, DISTRICTS_BY_PROVINCE, ADDRESS_TYPES, type Province } from "@/lib/nepal-geo";

export interface SavedAddress {
  _id?: string;
  label?: string;
  fullName?: string;
  phone?: string;
  province?: string;
  district?: string;
  municipality?: string;
  street?: string;
  landmark?: string;
  isDefault?: boolean;
}

interface AddAddressModalProps {
  fullName: string;
  phone: string;
  onClose: () => void;
  onSaved: (address: SavedAddress) => void;
}

export function AddAddressModal({ fullName, phone, onClose, onSaved }: AddAddressModalProps) {
  const [label, setLabel] = useState<string>("Home");
  const [province, setProvince] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [municipality, setMunicipality] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [landmark, setLandmark] = useState<string>("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const districts = province ? DISTRICTS_BY_PROVINCE[province as Province] : [];

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!fullName || !phone) {
      setError("Fill in your name and phone number (Personal Information) first.");
      return;
    }
    if (!province || !district || !street) {
      setError("Province, district and delivery address are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const addresses = await clientApi.post<SavedAddress[]>("/addresses", {
        label,
        fullName,
        phone,
        province,
        district,
        municipality,
        street,
        landmark,
      });
      const saved = addresses[addresses.length - 1];
      onSaved(saved);
    } catch (err) {
      setError(err instanceof ClientApiError ? err.message : "Could not save the address");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-text/40 px-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-surface shadow-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-border px-6 py-4">
          <div className="flex items-center gap-2">
            <Home className="size-5 text-accent" />
            <div>
              <h2 className="font-display text-xl text-text">Add New Address</h2>
              <p className="font-body text-sm text-muted">Save a new delivery address</p>
            </div>
          </div>
          <button onClick={onClose} aria-label="Close" className="text-muted hover:text-text">
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={save} className="space-y-5 px-6 py-5">
          <div>
            <p className="mb-2 font-data text-xs uppercase tracking-wide text-muted">Address Type</p>
            <select
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
            >
              {ADDRESS_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1 font-data text-xs uppercase tracking-wide text-muted">
              <MapPin className="size-3.5" /> Location
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="font-body text-sm text-text">Province *</span>
                <select
                  value={province}
                  required
                  onChange={(e) => {
                    setProvince(e.target.value);
                    setDistrict("");
                  }}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
                >
                  <option value="">Select province</option>
                  {PROVINCES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="font-body text-sm text-text">District *</span>
                <select
                  value={district}
                  required
                  disabled={!province}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent disabled:bg-bg disabled:text-muted"
                >
                  <option value="">{province ? "Select district" : "Select province first"}</option>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label className="mt-4 block">
              <span className="font-body text-sm text-text">Municipality / Area</span>
              <input
                value={municipality}
                disabled={!district}
                onChange={(e) => setMunicipality(e.target.value)}
                placeholder={district ? "e.g. Pokhara-8, Lakeside" : "Select district first"}
                className="mt-1 w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent disabled:bg-bg disabled:placeholder:text-muted"
              />
            </label>
          </div>

          <div>
            <p className="mb-2 flex items-center gap-1 font-data text-xs uppercase tracking-wide text-muted">
              <Home className="size-3.5" /> Delivery Detail
            </p>
            <textarea
              value={street}
              required
              rows={2}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="Delivery Address *"
              className="w-full rounded-md border border-border bg-surface px-3 py-2.5 font-body text-text outline-none focus:border-accent"
            />
            <p className="mt-1 font-body text-xs text-muted">House no., street, landmark, etc.</p>
          </div>

          {error && <p className="font-body text-sm text-sale">{error}</p>}

          <div className="flex justify-end gap-3 border-t border-border pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-border px-4 py-2 font-body text-sm text-text hover:border-accent hover:text-accent"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="rounded-md bg-accent px-5 py-2 font-body text-sm font-medium text-white hover:bg-accent-hover disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
