// src/adapters/packageAdapter.js
// Parse receiverInfo/senderInfo dạng "Tên - SĐT - địa chỉ"
function parseContact(text) {
  if (!text) return { name: "", phone: "", address: "" };
  // Tách tối đa 3 phần; phần còn lại (nếu có '-') gộp vào address
  const parts = String(text).split(/\s*-\s*/);
  const name = parts[0] || "";
  const phone = parts[1] || "";
  const address = parts.length > 2 ? parts.slice(2).join(" - ") : "";
  return { name, phone, address };
}

export function normalizePackage(p) {
  const receiver = parseContact(p.receiverInfo);
  const sender   = parseContact(p.senderInfo);

  return {
    // Dùng cho TABLE
    id: p.id,
    assignedTo: p.deliveryTripId ? `Trip #${p.deliveryTripId}` : "Unassigned",
    destination: receiver.address,     // → cột Destination
    recipient: receiver.name,          // → cột Recipient
    status: p.status,                  // PENDING / IN_TRANSIT / DELIVERED …
    type: p.packageDetails || "—",     // → cột Type
    createdAt: p.createdAt || null,    // nếu BE chưa trả, UI sẽ hiển thị —
    updatedAt: p.updatedAt || null,

    // Dùng cho MAP
    latitude:  p.latitude,
    longitude: p.longitude,

    // Thông tin bổ sung
    cod: p.codAmount,
    notes: p.notes,
    delivered: p.delivered,
    proofOfDeliveryUrl: p.proofOfDeliveryUrl,
    deliveryTripId: p.deliveryTripId,

    // Tham chiếu thô (nếu cần show chi tiết)
    _raw: p,
    _receiver: receiver,
    _sender: sender,
  };
}
