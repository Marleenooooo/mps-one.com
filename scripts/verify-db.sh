#!/usr/bin/env bash
set -euo pipefail

DB_CONTAINER=${DB_CONTAINER:-mpsone-db}
DB_USER=${DB_USER:-mpsone_dev}
DB_PASS=${DB_PASS:-devpass}
DB_NAME=${DB_NAME:-mpsone_dev}

echo ">> Verifying database contents..."

docker exec "$DB_CONTAINER" mysql -h 127.0.0.1 -u"$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "
SELECT (SELECT COUNT(*) FROM company) AS companies,
       (SELECT COUNT(*) FROM department) AS departments,
       (SELECT COUNT(*) FROM user) AS users;"

docker exec "$DB_CONTAINER" mysql -h 127.0.0.1 -u"$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "
SELECT name FROM company LIMIT 5;"

echo ">> Done."

# Extra: Verify PR columns and indexes align with app expectations
echo ">> Verifying PR columns and indexes..."
docker exec "$DB_CONTAINER" mysql -h 127.0.0.1 -u"$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "
SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr'
   AND COLUMN_NAME IN ('title','description','budget_code','approver');"

docker exec "$DB_CONTAINER" mysql -h 127.0.0.1 -u"$DB_USER" -p"$DB_PASS" -D "$DB_NAME" -e "
SELECT INDEX_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.STATISTICS
 WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pr'
   AND INDEX_NAME IN ('idx_pr_status','idx_pr_need_date');"

echo ">> Verification complete."
