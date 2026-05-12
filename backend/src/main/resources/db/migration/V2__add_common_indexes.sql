CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_delivery_trip_trip_date ON delivery_trip (trip_date);
CREATE INDEX idx_delivery_trip_status ON delivery_trip (status);
CREATE INDEX idx_delivery_trip_shipper_id_trip_date ON delivery_trip (shipper_id, trip_date);

CREATE INDEX idx_package_status_reconciled ON package (status, reconciled);
CREATE INDEX idx_package_reconciled_at ON package (reconciled_at);
CREATE INDEX idx_package_delivery_trip_id_status ON package (delivery_trip_id, status);
CREATE INDEX idx_package_receiver_info_trgm ON package USING gin (receiver_info gin_trgm_ops);
CREATE INDEX idx_package_sender_info_trgm ON package USING gin (sender_info gin_trgm_ops);
