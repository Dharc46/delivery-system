// File: Package.java
package com.example.delivery_system.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.Type;

@Entity
@Data
public class Package {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String senderInfo;
    private String receiverInfo;
    private Double latitude;
    private Double longitude;
    private String packageDetails;
    private Double codAmount;

    @Enumerated(EnumType.STRING)
    private PackageStatus status;

    private String notes;
    private String proofOfDeliveryUrl;

    @ManyToOne
    @JoinColumn(name = "delivery_trip_id")
    private DeliveryTrip deliveryTrip;

    // DI CHUYỂN TOÀN BỘ NỘI DUNG CỦA ENUM PackageStatus TỪ FILE PackageStatus.java VÀO ĐÂY
    // VÀ THÊM public static
    public static enum PackageStatus {
        /**
         * Đơn hàng vừa được tạo, chưa được xử lý
         */
        PENDING("Chờ xử lý", "Đơn hàng đã được tạo và đang chờ xử lý"),

        /**
         * Đơn hàng đã được xác nhận và sẵn sàng để giao
         */
        CONFIRMED("Đã xác nhận", "Đơn hàng đã được xác nhận và sẵn sàng giao"),

        /**
         * Đơn hàng đã được gán cho shipper và đưa vào chuyến giao hàng
         */
        ASSIGNED("Đã phân công", "Đơn hàng đã được phân công cho shipper"),

        /**
         * Shipper đang trên đường giao hàng
         */
        IN_TRANSIT("Đang giao hàng", "Shipper đang trên đường giao hàng"),

        /**
         * Shipper đã đến địa chỉ giao hàng
         */
        ARRIVED("Đã đến nơi", "Shipper đã đến địa chỉ giao hàng"),

        /**
         * Đơn hàng đã được giao thành công
         */
        DELIVERED("Đã giao thành công", "Đơn hàng đã được giao thành công cho người nhận"),

        /**
         * Không thể giao hàng thành công (người nhận không có mặt, từ chối nhận, v.v.)
         */
        FAILED("Giao hàng thất bại", "Không thể giao hàng thành công"),

        /**
         * Đơn hàng bị trả lại (sau khi giao hàng thất bại)
         */
        RETURNED("Đã trả lại", "Đơn hàng đã được trả lại cho người gửi"),

        /**
         * Đơn hàng bị hủy bởi admin hoặc customer
         */
        CANCELLED("Đã hủy", "Đơn hàng đã bị hủy"),

        /**
         * COD đã được đối soát và xác nhận
         */
        COD_CONFIRMED("COD đã xác nhận", "Số tiền COD đã được đối soát và xác nhận");

        private final String displayName;
        private final String description;

        PackageStatus(String displayName, String description) {
            this.displayName = displayName;
            this.description = description;
        }

        /**
         * Lấy tên hiển thị của trạng thái
         * @return Tên hiển thị tiếng Việt
         */
        public String getDisplayName() {
            return displayName;
        }

        /**
         * Lấy mô tả chi tiết của trạng thái
         * @return Mô tả chi tiết
         */
        public String getDescription() {
            return description;
        }

        /**
         * Kiểm tra xem trạng thái có phải là trạng thái cuối không
         * @return true nếu là trạng thái cuối (DELIVERED, RETURNED, CANCELLED)
         */
        public boolean isFinalStatus() {
            return this == DELIVERED || this == RETURNED || this == CANCELLED;
        }

        /**
         * Kiểm tra xem trạng thái có phải là trạng thái đang xử lý không
         * @return true nếu đang trong quá trình xử lý
         */
        public boolean isInProgress() {
            return this == CONFIRMED || this == ASSIGNED || this == IN_TRANSIT || this == ARRIVED;
        }

        /**
         * Kiểm tra xem trạng thái có phải là trạng thái thành công không
         * @return true nếu giao hàng thành công
         */
        public boolean isSuccessful() {
            return this == DELIVERED || this == COD_CONFIRMED;
        }

        /**
         * Kiểm tra xem trạng thái có phải là trạng thái thất bại không
         * @return true nếu giao hàng thất bại
         */
        public boolean isFailed() {
            return this == FAILED || this == RETURNED || this == CANCELLED;
        }

        /**
         * Lấy các trạng thái có thể chuyển đổi từ trạng thái hiện tại
         * @return Mảng các trạng thái có thể chuyển đổi
         */
        public PackageStatus[] getNextPossibleStatuses() {
            switch (this) {
                case PENDING:
                    return new PackageStatus[]{CONFIRMED, CANCELLED};
                case CONFIRMED:
                    return new PackageStatus[]{ASSIGNED, CANCELLED};
                case ASSIGNED:
                    return new PackageStatus[]{IN_TRANSIT, CANCELLED};
                case IN_TRANSIT:
                    return new PackageStatus[]{ARRIVED, FAILED};
                case ARRIVED:
                    return new PackageStatus[]{DELIVERED, FAILED};
                case DELIVERED:
                    return new PackageStatus[]{COD_CONFIRMED};
                case FAILED:
                    return new PackageStatus[]{RETURNED, ASSIGNED}; // Có thể thử giao lại
                case RETURNED:
                case CANCELLED:
                case COD_CONFIRMED:
                    return new PackageStatus[]{}; // Trạng thái cuối, không thể chuyển đổi
                default:
                    return new PackageStatus[]{};
            }
        }

        /**
         * Kiểm tra xem có thể chuyển đổi sang trạng thái mới không
         * @param newStatus Trạng thái mới muốn chuyển đổi
         * @return true nếu có thể chuyển đổi
         */
        public boolean canTransitionTo(PackageStatus newStatus) {
            PackageStatus[] possibleStatuses = getNextPossibleStatuses();
            for (PackageStatus status : possibleStatuses) {
                if (status == newStatus) {
                    return true;
                }
            }
            return false;
        }

        /**
         * Lấy màu sắc tương ứng với trạng thái (để hiển thị trên UI)
         * @return Mã màu hex
         */
        public String getColor() {
            switch (this) {
                case PENDING:
                    return "#6B7280"; // Gray
                case CONFIRMED:
                    return "#3B82F6"; // Blue
                case ASSIGNED:
                    return "#8B5CF6"; // Purple
                case IN_TRANSIT:
                    return "#F59E0B"; // Amber
                case ARRIVED:
                    return "#10B981"; // Emerald
                case DELIVERED:
                    return "#059669"; // Green
                case COD_CONFIRMED:
                    return "#065F46"; // Dark Green
                case FAILED:
                    return "#EF4444"; // Red
                case RETURNED:
                    return "#DC2626"; // Dark Red
                case CANCELLED:
                    return "#374151"; // Dark Gray
                default:
                    return "#6B7280"; // Default Gray
            }
        }

        /**
         * Lấy priority của trạng thái (để sắp xếp)
         * @return Số thứ tự ưu tiên (số càng nhỏ càng ưu tiên cao)
         */
        public int getPriority() {
            switch (this) {
                case FAILED:
                    return 1; // Ưu tiên cao nhất
                case IN_TRANSIT:
                    return 2;
                case ARRIVED:
                    return 3;
                case ASSIGNED:
                    return 4;
                case CONFIRMED:
                    return 5;
                case PENDING:
                    return 6;
                case DELIVERED:
                    return 7;
                case COD_CONFIRMED:
                    return 8;
                case RETURNED:
                    return 9;
                case CANCELLED:
                    return 10; // Ưu tiên thấp nhất
                default:
                    return 11;
            }
        }
    }
}