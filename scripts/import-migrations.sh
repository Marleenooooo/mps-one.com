#!/usr/bin/env bash
set -euo pipefail

# Import all SQL migrations into the running MySQL container.
# Defaults match docker-compose.yml and migration credentials.

DB_CONTAINER=${DB_CONTAINER:-mpsone-db}
DB_USER=${DB_USER:-mpsone_dev}
DB_PASS=${DB_PASS:-devpass}
DB_NAME=${DB_NAME:-mpsone_dev}
MIG_DIR=${MIG_DIR:-db/migrations}
DB_COMPOSE_DIR=${DB_COMPOSE_DIR:-db}

echo "Using container=$DB_CONTAINER user=$DB_USER db=$DB_NAME"

# Ensure the DB container is running; if not, try to start via docker compose
if ! docker ps --format '{{.Names}}\t{{.Status}}' | grep -q "^${DB_CONTAINER}\tUp "; then
  echo ">> ${DB_CONTAINER} is not running. Attempting to start via docker compose..."
  if [ -d "$DB_COMPOSE_DIR" ] && command -v docker >/dev/null 2>&1; then
    docker compose -f "$DB_COMPOSE_DIR/docker-compose.yml" up -d
  else
    echo "!! Cannot start ${DB_CONTAINER}: docker compose directory '$DB_COMPOSE_DIR' missing or docker not available."
    exit 1
  fi
fi

echo ">> Waiting for MySQL to be ready..."
for i in $(seq 1 60); do
  if docker exec "$DB_CONTAINER" mysqladmin ping -h 127.0.0.1 -u"$DB_USER" -p"$DB_PASS" --silent; then
    echo ">> MySQL is ready"
    break
  fi
  sleep 2
done

for f in $(ls "$MIG_DIR"/*.sql | sort); do
  echo ">> Importing $f"
  docker exec -i "$DB_CONTAINER" mysql --force -h 127.0.0.1 -u"$DB_USER" -p"$DB_PASS" "$DB_NAME" < "$f"
done

echo ">> All migrations imported successfully."
