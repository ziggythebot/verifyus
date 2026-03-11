#!/bin/bash
# Database setup script for VerifyUS
# Run this to create the database and apply the schema

set -e

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DB_NAME=${DB_NAME:-verifyus}
DB_USER=${DB_USER:-postgres}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}VerifyUS Database Setup${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if PostgreSQL is running
if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" > /dev/null 2>&1; then
  echo -e "${RED}Error: PostgreSQL is not running on $DB_HOST:$DB_PORT${NC}"
  echo "Please start PostgreSQL and try again."
  exit 1
fi

echo -e "${GREEN}✓${NC} PostgreSQL is running"

# Check if database exists
if psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -lqt | cut -d \| -f 1 | grep -qw "$DB_NAME"; then
  echo -e "${YELLOW}⚠${NC}  Database '$DB_NAME' already exists"
  read -p "Do you want to drop and recreate it? (y/N): " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Dropping database '$DB_NAME'...${NC}"
    dropdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
    echo -e "${GREEN}✓${NC} Database dropped"
  else
    echo "Skipping database creation..."
    DB_EXISTS=true
  fi
fi

# Create database if it doesn't exist
if [ -z "$DB_EXISTS" ]; then
  echo -e "${GREEN}Creating database '$DB_NAME'...${NC}"
  createdb -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME"
  echo -e "${GREEN}✓${NC} Database created"
fi

# Apply schema
echo -e "${GREEN}Applying schema...${NC}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SCRIPT_DIR/schema.sql" > /dev/null

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✓${NC} Schema applied successfully"
else
  echo -e "${RED}✗${NC} Error applying schema"
  exit 1
fi

# Verify tables
echo -e "${GREEN}Verifying tables...${NC}"
TABLE_COUNT=$(psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | xargs)

if [ "$TABLE_COUNT" -ge 7 ]; then
  echo -e "${GREEN}✓${NC} Found $TABLE_COUNT tables"
else
  echo -e "${RED}✗${NC} Expected 7+ tables, found $TABLE_COUNT"
  exit 1
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""
echo "Test employer account:"
echo "  Email: admin@test-agency.com"
echo "  Password: test123"
echo ""
echo -e "Connection string:"
echo -e "${YELLOW}postgresql://$DB_USER@$DB_HOST:$DB_PORT/$DB_NAME${NC}"
echo ""
echo "Next steps:"
echo "  1. Set DATABASE_URL environment variable"
echo "  2. Set PROOF_ENCRYPTION_KEY environment variable (32 bytes)"
echo "  3. Start your API server"
echo ""
