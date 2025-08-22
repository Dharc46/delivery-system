// AdminDashboard.jsx — Admin Dashboard with Map/Table/Analyze tabs + dark table view
import React, { useEffect, useMemo, useRef, useState } from "react";
import adminApi from "../api/adminApi";
import { normalizePackage } from "../adapters/packageAdapter";
import "./AdminDashboard.css";

/* Leaflet */
import {
  MapContainer,
  TileLayer,
  Popup,
  CircleMarker,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

// Backend base URL (dev default 8080, can override via VITE_API_BASE)
const API_BASE =
  (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) ||
  "http://localhost:8080";

// Lấy Authorization header từ localStorage (hoặc nơi bạn lưu token)
function getAuthHeaders() {
  try {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  } catch (_) {
    return {};
  }
}

/** Component nhỏ để điều khiển map.setView từ bên ngoài */
function FlyTo({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    if (center && Array.isArray(center)) {
      map.setView(center, zoom ?? map.getZoom(), { animate: true });
    }
  }, [center, zoom, map]);
  return null;
}

/** Icon rỗng (kính viễn vọng) */
function EmptyState() {
  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
      }}
    >
      {/* simple binoculars svg */}
      <svg
        width="140"
        height="140"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      >
        <path d="M7 7h2l1 3m5-3h2l-1 3" />
        <rect x="2" y="10" width="8" height="8" rx="3" />
        <rect x="14" y="10" width="8" height="8" rx="3" />
        <path d="M10 10h4v8h-4z" />
      </svg>
      <div style={{ marginTop: 10, fontSize: 22, color: "#e5e7eb" }}>
        No tasks to display
      </div>
      <div style={{ marginTop: 6, fontSize: 14 }}>
        Try changing your filters below to show some tasks.
      </div>
    </div>
  );
}

/** Bảng danh sách task */
function TasksTable({ rows, onAssignRequested }) {
  if (!rows || rows.length === 0) {
    return <EmptyState />;
  }

  const safe = (v, fb = "—") => (v === 0 || v ? v : fb);

  return (
    <div className="ad-table-wrap">
      <table className="ad-table">
        <thead>
          <tr>
            <th>Package ID</th>
            <th>Assigned to</th>
            <th>Destination</th>
            <th>Recipient</th>
            <th>Status</th>
            <th>Info</th>
            <th>SĐT</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p) => {
            const assignedTo =
              p.assignedTo || p.shipperName || p.shipperId || "Unassigned";
            const destination =
              p.destination ||
              p.address ||
              p.receiverAddress ||
              p.toAddress ||
              "—";
            const recipient =
              p.recipient || p.receiverName || p.contactName || "—";
            const info = p.type || p.category || "—";
            const phone = (p._receiver && p._receiver.phone) || p.phone || "—";
            return (
              <tr key={p.id}>
                <td>#{safe(p.id)}</td>
                <td>
                  {String(assignedTo).toLowerCase() === "unassigned" &&
                  onAssignRequested ? (
                    <button
                      className="ad-chip-link"
                      onClick={() => onAssignRequested(p.id)}
                    >
                      Unassigned
                    </button>
                  ) : (
                    safe(assignedTo)
                  )}
                </td>
                <td title={destination}>{safe(destination)}</td>
                <td>{safe(recipient)}</td>
                <td>
                  <span
                    className={`ad-badge ad-badge-${String(
                      p.status || ""
                    ).toLowerCase()}`}
                  >
                    {safe(p.status)}
                  </span>
                </td>
                <td>{safe(info)}</td>
                <td>{safe(phone)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [tasks, setTasks] = useState({ assigned: [], unassigned: [] });
  const [allPackages, setAllPackages] = useState([]);

  // Tabs: map | table | analyze
  const [tab, setTab] = useState("map");

  // state cho tìm kiếm địa điểm
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [searchCenter, setSearchCenter] = useState(null); // [lat, lng]
  const [searchPoint, setSearchPoint] = useState(null); // đối tượng đã chọn để vẽ marker
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);

  // Shippers + modals
  const [shippers, setShippers] = useState([]);
  const [selectedShipperId, setSelectedShipperId] = useState(null);
  const [showAddShipper, setShowAddShipper] = useState(false);
  const [showAddPackage, setShowAddPackage] = useState(false);

  // forms
  const [newShipper, setNewShipper] = useState({
    id: 0,
    fullName: "",
    phoneNumber: "",
    currentLatitude: 0,
    currentLongitude: 0,
    username: "",
    password: "",
  });
  const [newPackage, setNewPackage] = useState({
    receiverName: "",
    address: "",
    latitude: 0,
    longitude: 0,
    cod: 0,
  });
  const debounceRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const [s, p] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getAllPackages(),
        ]);
        setStats(s.data);

        const raw = Array.isArray(p.data) ? p.data : [];
        const pkgs = raw.map(normalizePackage);
        setTasks({
          unassigned: pkgs.filter(
            (x) => x.status === "PENDING" || !x.deliveryTripId
          ),
          assigned: pkgs.filter(
            (x) => x.deliveryTripId && x.status !== "DELIVERED"
          ),
        });
        setAllPackages?.(pkgs);
        // Tải danh sách shipper
        try {
          const resSh = await fetch(`${API_BASE}/api/v1/admin/shippers`, {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            headers: { ...getAuthHeaders() },
          });
          if (resSh.ok) {
            const dataSh = await resSh.json();
            const arr = Array.isArray(dataSh)
              ? dataSh
              : Array.isArray(dataSh?.data)
              ? dataSh.data
              : [];
            setShippers(arr);
          }
        } catch (e) {
          console.error("Lỗi tải shippers", e);
        }
      } catch (e) {
        console.error("Lỗi tải dashboard", e);
      }
    })();
  }, []);

  // Tổng hợp tất cả điểm có toạ độ hợp lệ để vẽ marker
  const points = useMemo(() => {
    const all = [...tasks.unassigned, ...tasks.assigned];
    return all.filter(
      (p) =>
        typeof p.latitude === "number" &&
        !Number.isNaN(p.latitude) &&
        typeof p.longitude === "number" &&
        !Number.isNaN(p.longitude)
    );
  }, [tasks]);

  const defaultCenter = [10.762622, 106.660172];
  const initialCenter = points.length
    ? [points[0].latitude, points[0].longitude]
    : defaultCenter;

  const onSearchChange = (val) => {
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        setIsLoadingSearch(true);
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          val.trim()
        )}&addressdetails=1&limit=5`;
        const res = await fetch(url, {
          headers: { Accept: "application/json" },
        });
        const data = await res.json();
        const items = Array.isArray(data)
          ? data.map((d) => ({
              display: d.display_name,
              lat: parseFloat(d.lat),
              lon: parseFloat(d.lon),
            }))
          : [];
        setSuggestions(items);
      } catch (e) {
        console.error("Search error:", e);
      } finally {
        setIsLoadingSearch(false);
      }
    }, 400);
  };

  const onPickSuggestion = (item) => {
    setQuery(item.display);
    setSuggestions([]);
    setSearchCenter([item.lat, item.lon]);
    setSearchPoint(item);
  };

  // API helpers
  async function createShipper() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/shippers`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(newShipper),
      });
      if (!res.ok) throw new Error("Tạo shipper thất bại");
      const sh = await res.json();
      setShippers((prev) => [...prev, sh]);
      setShowAddShipper(false);
      setNewShipper({
        id: 0,
        fullName: "",
        phoneNumber: "",
        currentLatitude: 0,
        currentLongitude: 0,
        username: "",
        password: "",
      });
      alert("Đã tạo shipper thành công");
    } catch (e) {
      console.error(e);
      alert("Không thể tạo shipper");
    }
  }

  async function createPackage() {
    try {
      const res = await fetch(`${API_BASE}/api/v1/admin/packages`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(newPackage),
      });
      if (!res.ok) throw new Error("Tạo package thất bại");
      const pkg = await res.json();
      const np = normalizePackage ? normalizePackage(pkg) : pkg;
      setAllPackages((prev) => [np, ...prev]);
      setTasks((prev) => ({
        ...prev,
        unassigned: [np, ...prev.unassigned],
      }));
      setShowAddPackage(false);
      setNewPackage({
        receiverName: "",
        address: "",
        latitude: 0,
        longitude: 0,
        cod: 0,
      });
      alert("Đã tạo package thành công");
    } catch (e) {
      console.error(e);
      alert("Không thể tạo package");
    }
  }

  async function assignPackageToSelected(pkgId) {
    if (!selectedShipperId) {
      alert("Hãy chọn shipper ở góc phải toolbar trước khi gán.");
      return;
    }
    try {
      // API mới: tạo chuyến + tối ưu + gán các package (ở đây gán 1 package)
      const res = await fetch(
        `${API_BASE}/api/v1/admin/delivery-trips/optimize`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", ...getAuthHeaders() },
          body: JSON.stringify({
            shipperId: Number(selectedShipperId),
            packageIds: [Number(pkgId)],
          }),
        }
      );
      if (!res.ok) throw new Error("Optimize trip thất bại");
      const data = await res.json(); // giả định backend trả về trip +/hoặc danh sách package đã gán

      // Cập nhật UI lạc quan:
      setTasks((prev) => {
        const idx = prev.unassigned.findIndex((x) => x.id === pkgId);
        if (idx >= 0) {
          const moving = {
            ...prev.unassigned[idx],
            status: "ASSIGNED",
            assignedTo: String(selectedShipperId),
            deliveryTripId: data?.id || prev.unassigned[idx]?.deliveryTripId,
          };
          const un = prev.unassigned
            .slice(0, idx)
            .concat(prev.unassigned.slice(idx + 1));
          const as = [moving, ...prev.assigned];
          return { unassigned: un, assigned: as };
        }
        return prev;
      });

      setAllPackages((prev) =>
        prev.map((p) =>
          p.id === pkgId
            ? {
                ...p,
                status: "ASSIGNED",
                assignedTo: String(selectedShipperId),
                deliveryTripId: data?.id || p.deliveryTripId,
              }
            : p
        )
      );
    } catch (e) {
      console.error(e);
      alert("Không thể tối ưu/tạo chuyến cho shipper đã chọn");
    }
  }

  if (!stats) {
    return (
      <div className="admin-dashboard-page">
        <div className="ad-loading">Đang tải dữ liệu…</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <header className="ad-header">
        <h1 className="ad-title">Admin Dashboard</h1>
        <div className="ad-meta">
          Tổng gói: <b>{stats.totalPackages ?? 0}</b> · Đang vận chuyển:{" "}
          <b>{stats.inTransitPackages ?? 0}</b> · Đã giao:{" "}
          <b>{stats.deliveredPackages ?? 0}</b>
        </div>
      </header>

      {/* thêm modifier class để điều khiển 2 cột/3 cột theo tab */}
      <div
        className={`ad-layout ${
          tab === "table" ? "no-rightbar" : "has-rightbar"
        }`}
      >
        <nav className="ad-sidebar">
          <div className="ad-logo">🚚 Admin</div>
          <ul className="ad-menu">
            <li
              className={tab === "map" ? "active" : ""}
              onClick={() => setTab("map")}
              role="button"
            >
              Map
            </li>
            <li
              className={tab === "table" ? "active" : ""}
              onClick={() => setTab("table")}
              role="button"
            >
              Table
            </li>
            <li
              className={tab === "analyze" ? "active" : ""}
              onClick={() => setTab("analyze")}
              role="button"
            >
              Analyze
            </li>
          </ul>
        </nav>

        <main className="ad-main">
          {/* Toolbar hành động */}
          <div className="ad-toolbar">
            <div className="ad-toolbar-left">
              <button
                className="ad-btn"
                onClick={() => setShowAddShipper(true)}
              >
                + Add Shipper
              </button>
              <button
                className="ad-btn"
                onClick={() => setShowAddPackage(true)}
              >
                + Add Package
              </button>
            </div>
            <div className="ad-toolbar-right">
              <label className="ad-label">Assign to:</label>
              <select
                className="ad-select"
                value={selectedShipperId ?? ""}
                onChange={(e) =>
                  setSelectedShipperId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
              >
                <option value="">-- chọn shipper --</option>
                {shippers.map((sh) => (
                  <option key={sh.id} value={sh.id}>
                    {sh.fullName || sh.username || "#" + sh.id}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {tab === "map" && (
            <section className="ad-map">
              <div className="ad-map-search">
                <input
                  value={query}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="ad-search-input"
                  type="search"
                  placeholder="Tìm địa điểm, địa chỉ… (VD: 1600 Amphitheatre, Quận 1)"
                  aria-label="Tìm kiếm địa điểm"
                />
                {isLoadingSearch && (
                  <div className="ad-search-status">Đang tìm…</div>
                )}
                {suggestions.length > 0 && (
                  <div className="ad-search-dropdown" role="listbox">
                    {suggestions.map((sug, idx) => (
                      <div
                        key={`${sug.lat}-${sug.lon}-${idx}`}
                        className="ad-search-item"
                        onClick={() => onPickSuggestion(sug)}
                        role="option"
                      >
                        {sug.display}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <MapContainer
                center={initialCenter}
                zoom={12}
                scrollWheelZoom
                zoomControl={false}
                style={{ height: "100%", width: "100%" }}
              >
                {searchCenter && <FlyTo center={searchCenter} zoom={14} />}

                <TileLayer
                  attribution="&copy; OpenStreetMap contributors"
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {points.map((p) => {
                  const isAssigned =
                    p.status === "ASSIGNED" || p.status === "IN_TRANSIT";
                  const color = isAssigned ? "#3b82f6" : "#f59e0b";
                  return (
                    <CircleMarker
                      key={p.id}
                      center={[p.latitude, p.longitude]}
                      radius={8}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.9,
                      }}
                    >
                      <Popup>
                        <div style={{ fontSize: 13, minWidth: 180 }}>
                          <div>
                            <b>#{p.id}</b> — {p.status}
                          </div>
                          <div>
                            {p.receiverName || p.description || "Package"}
                          </div>
                          {p.address && <div>{p.address}</div>}
                          {p.cod != null && (
                            <div>
                              COD: <b>{p.cod}</b>
                            </div>
                          )}
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}

                {searchPoint && (
                  <CircleMarker
                    center={[searchPoint.lat, searchPoint.lon]}
                    radius={9}
                    pathOptions={{
                      color: "#22c55e",
                      fillColor: "#22c55e",
                      fillOpacity: 0.95,
                    }}
                  >
                    <Popup>
                      <div style={{ fontSize: 13, minWidth: 180 }}>
                        <b>Địa điểm đã chọn</b>
                        <div>{searchPoint.display}</div>
                        <div>Lat: {searchPoint.lat.toFixed(6)}</div>
                        <div>Lng: {searchPoint.lon.toFixed(6)}</div>
                      </div>
                    </Popup>
                  </CircleMarker>
                )}
              </MapContainer>
            </section>
          )}

          {tab === "table" && (
            <section className="ad-panel">
              <TasksTable
                rows={allPackages}
                onAssignRequested={(id) => assignPackageToSelected(id)}
              />
            </section>
          )}

          {tab === "analyze" && (
            <section className="ad-panel ad-map">
              <div className="ad-map-placeholder">
                Analyze will be here soon…
              </div>
            </section>
          )}

          {/* Modals */}
          {showAddShipper && (
            <div className="ad-modal" role="dialog" aria-modal="true">
              <div className="ad-modal-content">
                <div className="ad-modal-header">
                  <h3>New Shipper</h3>
                  <button
                    className="ad-btn-ghost"
                    onClick={() => setShowAddShipper(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="ad-form">
                  <label>ID</label>
                  <input
                    className="ad-input"
                    type="number"
                    value={newShipper.id}
                    onChange={(e) =>
                      setNewShipper({
                        ...newShipper,
                        id: Number(e.target.value),
                      })
                    }
                  />
                  <label>Full name</label>
                  <input
                    className="ad-input"
                    value={newShipper.fullName}
                    onChange={(e) =>
                      setNewShipper({ ...newShipper, fullName: e.target.value })
                    }
                  />
                  <label>Phone</label>
                  <input
                    className="ad-input"
                    value={newShipper.phoneNumber}
                    onChange={(e) =>
                      setNewShipper({
                        ...newShipper,
                        phoneNumber: e.target.value,
                      })
                    }
                  />
                  <label>Latitude</label>
                  <input
                    className="ad-input"
                    type="number"
                    value={newShipper.currentLatitude}
                    onChange={(e) =>
                      setNewShipper({
                        ...newShipper,
                        currentLatitude: Number(e.target.value),
                      })
                    }
                  />
                  <label>Longitude</label>
                  <input
                    className="ad-input"
                    type="number"
                    value={newShipper.currentLongitude}
                    onChange={(e) =>
                      setNewShipper({
                        ...newShipper,
                        currentLongitude: Number(e.target.value),
                      })
                    }
                  />
                  <label>Username</label>
                  <input
                    className="ad-input"
                    value={newShipper.username}
                    onChange={(e) =>
                      setNewShipper({ ...newShipper, username: e.target.value })
                    }
                  />
                  <label>Password</label>
                  <input
                    className="ad-input"
                    type="password"
                    value={newShipper.password}
                    onChange={(e) =>
                      setNewShipper({ ...newShipper, password: e.target.value })
                    }
                  />
                </div>
                <div className="ad-modal-actions">
                  <button className="ad-btn" onClick={createShipper}>
                    Create
                  </button>
                  <button
                    className="ad-btn-ghost"
                    onClick={() => setShowAddShipper(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {showAddPackage && (
            <div className="ad-modal" role="dialog" aria-modal="true">
              <div className="ad-modal-content">
                <div className="ad-modal-header">
                  <h3>New Package</h3>
                  <button
                    className="ad-btn-ghost"
                    onClick={() => setShowAddPackage(false)}
                  >
                    ✕
                  </button>
                </div>
                <div className="ad-form">
                  <label>Receiver</label>
                  <input
                    className="ad-input"
                    value={newPackage.receiverName}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        receiverName: e.target.value,
                      })
                    }
                  />
                  <label>Address</label>
                  <input
                    className="ad-input"
                    value={newPackage.address}
                    onChange={(e) =>
                      setNewPackage({ ...newPackage, address: e.target.value })
                    }
                  />
                  <label>Latitude</label>
                  <input
                    className="ad-input"
                    type="number"
                    value={newPackage.latitude}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        latitude: Number(e.target.value),
                      })
                    }
                  />
                  <label>Longitude</label>
                  <input
                    className="ad-input"
                    type="number"
                    value={newPackage.longitude}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        longitude: Number(e.target.value),
                      })
                    }
                  />
                  <label>COD</label>
                  <input
                    className="ad-input"
                    type="number"
                    value={newPackage.cod}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        cod: Number(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="ad-modal-actions">
                  <button className="ad-btn" onClick={createPackage}>
                    Create
                  </button>
                  <button
                    className="ad-btn-ghost"
                    onClick={() => setShowAddPackage(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
        {(tab === "map" || tab === "analyze") && (
          <aside className="ad-rightbar">
            {tab === "map" ? (
              <>
                <h2 className="ad-section-title">Packages</h2>
                <div className="ad-task-group">
                  <h3>Unassigned ({tasks.unassigned.length})</h3>
                  <ul>
                    {tasks.unassigned.map((t) => {
                      const info = t.type || t.packageDetails || "";
                      const name =
                        String(info).split(",")[0].trim() || `#${t.id}`;
                      const canFly =
                        typeof t.latitude === "number" &&
                        typeof t.longitude === "number";
                      return (
                        <li
                          key={t.id}
                          className="ad-task"
                          onClick={() => {
                            if (selectedShipperId) {
                              assignPackageToSelected(t.id);
                            } else if (canFly) {
                              setSearchCenter([t.latitude, t.longitude]);
                            }
                          }}
                          role="button"
                          title={info}
                        >
                          {name}
                        </li>
                      );
                    })}
                    {tasks.unassigned.length === 0 && (
                      <li className="ad-empty">Không có package</li>
                    )}
                  </ul>
                </div>

                <div className="ad-task-group">
                  <h3>Assigned ({tasks.assigned.length})</h3>
                  <ul>
                    {tasks.assigned.map((t) => {
                      const info = t.type || t.packageDetails || "";
                      const name =
                        String(info).split(",")[0].trim() || `#${t.id}`;
                      const canFly =
                        typeof t.latitude === "number" &&
                        typeof t.longitude === "number";
                      return (
                        <li
                          key={t.id}
                          className="ad-task"
                          onClick={() => {
                            if (selectedShipperId) {
                              assignPackageToSelected(t.id);
                            } else if (canFly) {
                              setSearchCenter([t.latitude, t.longitude]);
                            }
                          }}
                          role="button"
                          title={info}
                        >
                          {name}
                        </li>
                      );
                    })}
                    {tasks.assigned.length === 0 && (
                      <li className="ad-empty">Không có package</li>
                    )}
                  </ul>
                </div>
              </>
            ) : (
              <>
                <h2 className="ad-section-title">Analyze — Insights</h2>

                <div className="ad-task-group">
                  <h3>Tổng quan</h3>
                  <ul>
                    <li className="ad-task">ETA trung vị: 35 phút</li>
                    <li className="ad-task">
                      Tỉ lệ giao thành công hôm nay: 92%
                    </li>
                    <li className="ad-task">Đơn có rủi ro trễ: 7</li>
                  </ul>
                </div>

                <div className="ad-task-group">
                  <h3>Cảnh báo</h3>
                  <ul>
                    <li className="ad-task">
                      Shipper #S12 có 3 điểm dừng cách nhau &gt; 8km
                    </li>
                    <li className="ad-task">
                      Cụm Q.9 mật độ đơn cao, cân nhắc gom tuyến
                    </li>
                  </ul>
                </div>

                <div className="ad-task-group">
                  <h3>Bộ lọc nhanh</h3>
                  <ul>
                    <li className="ad-task" role="button">
                      Chỉ xem COD &gt; 500k
                    </li>
                    <li className="ad-task" role="button">
                      Chỉ xem đơn nguy cơ trễ
                    </li>
                  </ul>
                </div>
              </>
            )}
          </aside>
        )}
      </div>

      <style>{`
        .ad-panel{ background: var(--panel); border-radius: var(--radius); padding: 12px; min-height: 360px; }
        .ad-table-wrap{ width:100%; overflow:auto; }
        .ad-table{ width:100%; border-collapse: collapse; font-size: 13px; }
        .ad-table thead th{ position: sticky; top:0; text-align:left; font-weight:700; background:#1f1f2e; color:var(--muted); padding:10px; border-bottom:1px solid var(--line); }
        .ad-table tbody td{ padding:10px; border-bottom:1px solid var(--line); color:var(--text); white-space: nowrap; text-overflow: ellipsis; overflow: hidden; max-width: 320px; }
        .ad-table tbody tr:hover{ background:#2f2f44; }
        .ad-badge{ display:inline-block; padding:2px 8px; border-radius:999px; font-size:12px; background:#303049; }
        .ad-badge-assigned, .ad-badge-in_transit{ background:#1f3a68; }
        .ad-badge-unassigned{ background:#553a05; }
        .ad-badge-delivered{ background:#1f4d30; }
      `}</style>
    </div>
  );
}
