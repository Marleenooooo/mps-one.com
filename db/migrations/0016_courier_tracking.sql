-- Shipment Tracking (Courier Webhooks)
CREATE TABLE IF NOT EXISTS shipment_tracking (
  id INT AUTO_INCREMENT PRIMARY KEY,
  po_id INT NOT NULL,
  vendor VARCHAR(50) NOT NULL,
  tracking_no VARCHAR(64) NOT NULL,
  status VARCHAR(50) NULL,
  events_json JSON NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_tracking_vendor_no (vendor, tracking_no)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

