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
  // Parse receiverInfo: nếu là địa chỉ (không chứa "-" ở đầu) thì để nguyên
  // Nếu là dạng "Tên - SĐT - địa chỉ" thì parse
  let receiver = { name: "", phone: "", address: "" };
  if (p.receiverInfo) {
    if (p.receiverInfo.includes(" - ")) {
      // Dạng "Tên - SĐT - địa chỉ"
      receiver = parseContact(p.receiverInfo);
    } else {
      // Dạng địa chỉ thuần
      receiver = { name: "", phone: "", address: p.receiverInfo };
    }
  }

  // senderInfo hiện tại là "lat, lon" nên không parse
  // Nếu trong tương lai là dạng contact string thì parse
  let sender = { name: "", phone: "", address: "" };
  if (p.senderInfo) {
    if (p.senderInfo.includes(" - ")) {
      // Dạng "Tên - SĐT - địa chỉ"
      sender = parseContact(p.senderInfo);
    } else {
      // Dạng khác (có thể là "lat, lon") - không parse
      sender = { name: "", phone: "", address: "" };
    }
  }

  return {
    // Dùng cho TABLE
    id: p.id,
    assignedTo: p.deliveryTripId ? `Trip #${p.deliveryTripId}` : "Unassigned",
    destination: receiver.address || p.address, // → cột Destination (ưu tiên receiverInfo -> address field)
    recipient: receiver.name, // → cột Recipient
    status: p.status, // PENDING / IN_TRANSIT / DELIVERED …
    type: p.packageDetails || "—", // → cột Type
    createdAt: p.createdAt || null, // nếu BE chưa trả, UI sẽ hiển thị —
    updatedAt: p.updatedAt || null,

    // Dùng cho MAP
    latitude: p.latitude,
    longitude: p.longitude,

    // Thông tin bổ sung
    cod: p.codAmount,
    notes: p.notes,
    delivered: p.delivered,
    proofOfDeliveryUrl: p.proofOfDeliveryUrl,
    deliveryTripId: p.deliveryTripId,
    address: p.address, // Giữ nguyên field address từ API

    // Tham chiếu thô (nếu cần show chi tiết)
    _raw: p,
    _receiver: receiver,
    _sender: sender,
  };
}
