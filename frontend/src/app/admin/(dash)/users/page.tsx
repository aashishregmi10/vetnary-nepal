"use client";

import { useEffect, useState } from "react";
import { clientApi } from "@/lib/client-api";

interface AdminUser {
  _id: string;
  fullName: string;
  email: string;
  isAdmin: boolean;
  isBanned: boolean;
  createdAt: string;
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);

  function load() {
    clientApi.get<AdminUser[]>("/admin/users").then(setUsers).catch(() => {});
  }
  useEffect(load, []);

  async function toggleBan(u: AdminUser) {
    await clientApi.put(`/admin/users/${u._id}/ban`, { isBanned: !u.isBanned });
    load();
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-text">Customers</h1>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-surface">
        <table className="w-full font-body text-sm">
          <thead>
            <tr className="border-b border-border text-left text-muted">
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-b border-border/60 last:border-0">
                <td className="px-4 py-3 text-text">{u.fullName}</td>
                <td className="px-4 py-3 text-muted">{u.email}</td>
                <td className="px-4 py-3 text-muted">{u.isAdmin ? "Admin" : "Customer"}</td>
                <td className="px-4 py-3">
                  <span className={u.isBanned ? "text-sale" : "text-text"}>{u.isBanned ? "Suspended" : "Active"}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  {!u.isAdmin && (
                    <button onClick={() => toggleBan(u)} className="text-muted hover:text-accent">
                      {u.isBanned ? "Reinstate" : "Suspend"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
