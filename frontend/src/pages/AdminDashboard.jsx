// AdminDashboard.jsx — Admin Dashboard with Route Preview
// v4: Fix ReferenceError (senderAddress not defined) + robust address extraction helpers
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
  Polyline,
  Marker,
  Tooltip,
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
                      p.status || "",
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

/* ==== Helpers: parse & extract addresses + geocoding ==== */

// Tách địa chỉ/tên/SĐT từ chuỗi "Tên - SĐT - Địa chỉ"
function parseContactString(raw) {
  if (!raw) return { name: "", phone: "", address: "" };
  const parts = String(raw)
    .split(" - ")
    .map((s) => s.trim());
  return {
    name: parts[0] || "",
    phone: parts[1] || "",
    address: parts.slice(2).join(" - ") || "", // phòng trường hợp địa chỉ cũng có dấu "-"
  };
}

// Lấy địa chỉ người gửi từ nhiều field có thể có
function getSenderAddressFromPackage(pkg) {
  // senderInfo được tạo từ: "latitude, longitude"
  // Vì vậy ta sẽ lấy từ shipper hoặc các trường khác
  // Hoặc nếu là dạng contact string thì parse
  if (pkg?.senderInfo) {
    // Nếu là dạng "lat, lon" thì bỏ qua
    if (
      pkg.senderInfo.includes(",") &&
      !isNaN(parseFloat(pkg.senderInfo.split(",")[0]))
    ) {
      return ""; // Trả về rỗng, vì senderInfo chỉ có tọa độ
    }
    // Nếu là dạng "Tên - SĐT - Địa chỉ" thì parse
    const parsed = parseContactString(pkg.senderInfo);
    if (parsed.address) return parsed.address;
  }
  // Ưu tiên lấy từ các trường khác nếu có
  if (pkg?._sender?.address) return pkg._sender.address;
  if (pkg?._raw?.senderInfo) {
    const parsed = parseContactString(pkg._raw.senderInfo);
    if (parsed.address) return parsed.address;
  }
  // Alias khác
  return pkg?.originAddress || pkg?.fromAddress || pkg?.senderAddress || "";
}

// Lấy địa chỉ người nhận từ nhiều field có thể có
function getReceiverAddressFromPackage(pkg) {
  // Thứ tự ưu tiên:
  // 1. address field (đây là field chính từ form)
  // 2. receiverInfo (nếu không phải dạng "lat, lon")
  // 3. destination (từ normalized data)

  // Lấy từ address field trước (field chính từ API)
  if (pkg?.address) {
    return pkg.address;
  }

  // Kiểm tra receiverInfo
  if (pkg?.receiverInfo) {
    // Nếu không phải dạng "lat, lon" thì dùng
    if (
      !pkg.receiverInfo.includes(",") ||
      isNaN(parseFloat(pkg.receiverInfo.split(",")[0]))
    ) {
      return pkg.receiverInfo;
    }
  }

  // Fallback: từ destination (normalized)
  if (pkg?.destination) {
    return pkg.destination;
  }

  return "";
}

// Bỏ dấu tiếng Việt (accent folding)
function foldAccents(str) {
  if (!str) return "";
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

// Chuẩn hoá địa chỉ Việt Nam, thêm ", Việt Nam" nếu thiếu + chuẩn hoá quận/huyện
function normalizeVietnamAddress(addr) {
  if (!addr) return "";
  let a = String(addr).replace(/\s+/g, " ").trim();
  // Thay 1 số từ/cụm thường gặp
  a = a
    .replace(/\bTP\.\s*/gi, "Thành phố ")
    .replace(/\bQ\.\s*/gi, "Quận ")
    .replace(/\bP\.\s*/gi, "Phường ")
    .replace(/\bĐường\b/gi, "Đường");
  // Thêm quốc gia nếu thiếu
  const hasVN =
    /vi(?:e|ê)t\s*nam/i.test(a) ||
    /ha noi|hà nội|ho chi minh|hồ chí minh|hcm/i.test(foldAccents(a));
  if (!hasVN) a = a + ", Việt Nam";
  return a;
}

// Sleep nhỏ cho retry
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// Kiểm tra lat/lon hợp lệ và không phải (0,0)
function isValidPoint(obj) {
  if (!obj) return false;
  const { lat, lon } = obj;
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    Math.abs(lat) > 1 &&
    Math.abs(lon) > 1
  );
}

// Geocode qua Nominatim với nhiều chiến lược
async function geocodeAddress(addr) {
  const raw = addr || "";
  const q = normalizeVietnamAddress(raw);
  const qFold = foldAccents(q);

  const tries = [
    // 1) VN bias
    {
      name: "vn-bias",
      url:
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&countrycodes=vn&accept-language=vi&q=" +
        encodeURIComponent(q),
    },
    // 2) Không giới hạn quốc gia
    {
      name: "global",
      url:
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&accept-language=vi&q=" +
        encodeURIComponent(q),
    },
    // 3) Accent folding
    {
      name: "folded",
      url:
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&accept-language=vi&q=" +
        encodeURIComponent(qFold),
    },
  ];

  // 4) Structured: tách 'đường, quận, thành phố'
  const parts = raw.split(",").map((s) => s.trim());
  if (parts.length >= 2) {
    const street = parts[0];
    const city = parts.slice(1).join(", ");
    const streetQ = normalizeVietnamAddress(street);
    const cityQ = normalizeVietnamAddress(city);
    tries.push({
      name: "structured",
      url:
        "https://nominatim.openstreetmap.org/search?format=json&limit=1&addressdetails=1&accept-language=vi&street=" +
        encodeURIComponent(streetQ) +
        "&city=" +
        encodeURIComponent(cityQ),
    });
  }

  for (let i = 0; i < tries.length; i++) {
    const t = tries[i];
    try {
      const res = await fetch(t.url, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        console.warn("[Geocode][" + t.name + "] http", res.status);
      } else {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const p = {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
          };
          console.log("[Geocode][" + t.name + "]", data[0].display_name, p);
          return {
            point: p,
            meta: { name: t.name, display: data[0].display_name },
          };
        }
      }
    } catch (e) {
      console.warn("[Geocode][" + t.name + "] exception", e);
    }
    await wait(250); // backoff nhẹ giữa các lần thử
  }
  return { point: null, meta: { reason: "no-match", q, qFold } };
}

// Gọi OSRM để lấy route polyline theo thứ tự (shipper -> sender -> receiver)
async function fetchOsrmRoute(points /* [{lat, lon}, ...] */) {
  const coords = points.map((p) => `${p.lon},${p.lat}`).join(";");
  const url = `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("OSRM request failed");
  const json = await res.json();
  if (json?.routes?.length) {
    // Leaflet expects [lat,lng]
    return json.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  }
  return null;
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
    senderAddress: "",
    receiverName: "",
    receiverPhone: "",
    receiverAddress: "",
    packageDetails: "",
    codAmount: 0,
    latitude: 0,
    longitude: 0,
    notes: "",
  });
  const debounceRef = useRef(null);

  // ==== State hiển thị route preview ====
  const [routeLine, setRouteLine] = useState(null); // [[lat,lng], ...]
  const [routeStops, setRouteStops] = useState(null); // { shipper, sender, receiver }
  const [previewPkgId, setPreviewPkgId] = useState("");

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
            (x) => x.status === "PENDING" || !x.deliveryTripId,
          ),
          assigned: pkgs.filter(
            (x) => x.deliveryTripId && x.status !== "DELIVERED",
          ),
        });
        setAllPackages?.(pkgs);
        // Tải danh sách shipper
        try {
          const resSh = await fetch(`${API_BASE}/api/v1/admin/shippers`, {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
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
        !Number.isNaN(p.longitude),
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
          val.trim(),
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
      // Tự động tạo senderInfo và receiverInfo từ các trường
      const packageData = {
        senderInfo: newPackage.senderAddress,
        receiverInfo: `${newPackage.receiverName} - ${newPackage.receiverPhone} - ${newPackage.receiverAddress}`,
        address: newPackage.receiverAddress, // Lưu receiver address vào field address
        latitude: newPackage.latitude || 0,
        longitude: newPackage.longitude || 0,
        packageDetails: newPackage.packageDetails || "",
        codAmount: newPackage.codAmount || 0,
        notes: newPackage.notes || "",
      };

      const res = await fetch(`${API_BASE}/api/v1/admin/packages`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        body: JSON.stringify(packageData),
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
        senderAddress: "",
        receiverName: "",
        receiverPhone: "",
        receiverAddress: "",
        packageDetails: "",
        codAmount: 0,
        latitude: 0,
        longitude: 0,
        notes: "",
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
        },
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
            : p,
        ),
      );
    } catch (e) {
      console.error(e);
      alert("Không thể tối ưu/tạo chuyến cho shipper đã chọn");
    }
  }

  // ==== Build route cho 1 package + 1 shipper ====
  async function buildRouteFor(pkgId, shipperId) {
    try {
      const pkg = allPackages.find((p) => p.id === Number(pkgId));
      const shipper = shippers.find((s) => s.id === Number(shipperId));
      if (!pkg || !shipper) {
        alert("Thiếu package hoặc shipper");
        return;
      }

      console.log("[Route] package:", pkg);
      console.log("[Route] shipper:", shipper);

      // 1) Toạ độ shipper có sẵn
      const shipperPoint = {
        lat: Number(shipper.currentLatitude),
        lon: Number(shipper.currentLongitude),
      };

      // 2) Lấy địa chỉ người nhận
      const receiverAddress = getReceiverAddressFromPackage(pkg);
      console.log("[Geocode] using receiver address:", receiverAddress);

      // 3) Tìm lat/lng người nhận
      let receiverPoint = null;
      if (
        typeof pkg.latitude === "number" &&
        typeof pkg.longitude === "number" &&
        Math.abs(pkg.latitude) > 1 &&
        Math.abs(pkg.longitude) > 1
      ) {
        receiverPoint = { lat: pkg.latitude, lon: pkg.longitude };
      } else {
        const { point, meta } = await geocodeAddress(receiverAddress || "");
        receiverPoint = point;
        if (!point) console.warn("[Geocode] receiver meta:", meta);
      }

      if (!isValidPoint(receiverPoint)) {
        console.warn("[Geocode] receiver address:", receiverAddress);
        alert(
          "Không geocode được địa chỉ người nhận.\n" +
            "Receiver: " +
            (receiverAddress || "(rỗng)") +
            "\n" +
            "Ví dụ hợp lệ: '456 Đường Láng, Đống Đa, Hà Nội, Việt Nam'.",
        );
        return;
      }

      // 4) Gọi OSRM theo thứ tự shipper -> receiver (không cần sender vì shipper là điểm xuất phát)
      const line = await fetchOsrmRoute([shipperPoint, receiverPoint]);
      setRouteLine(line);
      setRouteStops({
        shipper: shipperPoint,
        receiver: receiverPoint,
      });

      // Zoom map vào giữa tuyến
      if (line && line.length) {
        const mid = line[Math.floor(line.length / 2)];
        setSearchCenter(mid);
      }
    } catch (e) {
      console.error(e);
      alert("Không thể tạo lộ trình");
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
                    e.target.value ? Number(e.target.value) : null,
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

              {/* Preview Route controls */}
              <input
                className="ad-input"
                style={{ marginLeft: 8, width: 120 }}
                placeholder="Package ID"
                value={previewPkgId}
                onChange={(e) => setPreviewPkgId(e.target.value)}
                type="number"
              />
              <button
                className="ad-btn"
                disabled={!selectedShipperId || !previewPkgId}
                onClick={() => buildRouteFor(previewPkgId, selectedShipperId)}
                title="Vẽ lộ trình: Shipper → Người gửi → Người nhận"
                style={{ marginLeft: 6 }}
              >
                Preview Route
              </button>
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
                  placeholder="Tìm địa điểm, địa chỉ… (VD: 456 Đường Láng, Đống Đa, Hà Nội)"
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
                    <React.Fragment key={p.id}>
                      <CircleMarker
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
                      <CircleMarker
                        center={[p.latitude, p.longitude]}
                        radius={2}
                        pathOptions={{
                          color: "#FFFFFF",
                          fillColor: "#FFFFFF",
                          fillOpacity: 1,
                        }}
                      />
                    </React.Fragment>
                  );
                })}

                {/* ==== Route preview: Polyline + 3 markers ==== */}
                {routeLine && (
                  <Polyline
                    positions={routeLine}
                    pathOptions={{ weight: 5, opacity: 0.9 }}
                  />
                )}
                {routeStops?.shipper && (
                  <Marker
                    position={[routeStops.shipper.lat, routeStops.shipper.lon]}
                  >
                    <Tooltip direction="top" offset={[0, -10]} permanent>
                      Shipper (Start)
                    </Tooltip>
                  </Marker>
                )}
                {routeStops?.sender && (
                  <Marker
                    position={[routeStops.sender.lat, routeStops.sender.lon]}
                  >
                    <Tooltip direction="top" offset={[0, -10]} permanent>
                      Sender (Stop 1)
                    </Tooltip>
                  </Marker>
                )}
                {routeStops?.receiver && (
                  <Marker
                    position={[
                      routeStops.receiver.lat,
                      routeStops.receiver.lon,
                    ]}
                  >
                    <Tooltip direction="top" offset={[0, -10]} permanent>
                      Receiver (Stop 2)
                    </Tooltip>
                  </Marker>
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
                  <label>Sender Address *</label>
                  <input
                    className="ad-input"
                    placeholder="Địa chỉ người gửi"
                    value={newPackage.senderAddress}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        senderAddress: e.target.value,
                      })
                    }
                  />
                  <label>Receiver Name *</label>
                  <input
                    className="ad-input"
                    placeholder="Tên người nhận"
                    value={newPackage.receiverName}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        receiverName: e.target.value,
                      })
                    }
                  />
                  <label>Receiver Phone *</label>
                  <input
                    className="ad-input"
                    placeholder="Số điện thoại người nhận"
                    value={newPackage.receiverPhone}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        receiverPhone: e.target.value,
                      })
                    }
                  />
                  <label>Receiver Address *</label>
                  <input
                    className="ad-input"
                    placeholder="Địa chỉ người nhận"
                    value={newPackage.receiverAddress}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        receiverAddress: e.target.value,
                      })
                    }
                  />
                  <label>Package Details</label>
                  <input
                    className="ad-input"
                    placeholder="Loại gói hàng (VD: Tài liệu, Thực phẩm, Điện tử...)"
                    value={newPackage.packageDetails}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        packageDetails: e.target.value,
                      })
                    }
                  />
                  <label>Latitude *</label>
                  <input
                    className="ad-input"
                    type="number"
                    step="0.0001"
                    placeholder="10.7769"
                    value={newPackage.latitude}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        latitude: Number(e.target.value),
                      })
                    }
                  />
                  <label>Longitude *</label>
                  <input
                    className="ad-input"
                    type="number"
                    step="0.0001"
                    placeholder="106.7009"
                    value={newPackage.longitude}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        longitude: Number(e.target.value),
                      })
                    }
                  />
                  <label>COD Amount</label>
                  <input
                    className="ad-input"
                    type="number"
                    placeholder="Số tiền thu hộ (VND)"
                    value={newPackage.codAmount}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        codAmount: Number(e.target.value),
                      })
                    }
                  />
                  <label>Notes</label>
                  <input
                    className="ad-input"
                    placeholder="Ghi chú thêm (tùy chọn)"
                    value={newPackage.notes}
                    onChange={(e) =>
                      setNewPackage({
                        ...newPackage,
                        notes: e.target.value,
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
