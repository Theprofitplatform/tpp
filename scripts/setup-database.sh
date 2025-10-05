#!/bin/bash

# Setup PostgreSQL database for n8n SEO Workflow
# Creates required tables and seed data

set -euo pipefail

echo "🗄️  Setting up PostgreSQL database for SEO Workflow..."

# Database connection details
DB_NAME="${DB_NAME:-n8n}"
DB_USER="${DB_USER:-n8nuser}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo "Database: $DB_NAME"
echo "User: $DB_USER"
echo "Host: $DB_HOST:$DB_PORT"
echo ""

# Create SQL setup file
SQL_FILE="/tmp/seo_workflow_setup.sql"

cat > "$SQL_FILE" <<'EOF'
-- SEO Analysis Table
CREATE TABLE IF NOT EXISTS seo_analysis (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL,
  seo_score INTEGER NOT NULL CHECK (seo_score >= 0 AND seo_score <= 100),
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_seo_content_id ON seo_analysis(content_id);
CREATE INDEX IF NOT EXISTS idx_seo_score ON seo_analysis(seo_score);
CREATE INDEX IF NOT EXISTS idx_seo_created_at ON seo_analysis(created_at DESC);

-- Competitor Analysis Table
CREATE TABLE IF NOT EXISTS competitor_analysis (
  id SERIAL PRIMARY KEY,
  url VARCHAR(512) NOT NULL UNIQUE,
  avg_score INTEGER CHECK (avg_score >= 0 AND avg_score <= 100),
  gaps JSONB,
  last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for competitor lookups
CREATE INDEX IF NOT EXISTS idx_competitor_url ON competitor_analysis(url);

-- Seed competitor data
INSERT INTO competitor_analysis (url, avg_score, gaps) VALUES
  ('https://example.com/digital-marketing', 78, '["lacks long-tail keywords", "missing H2 headings", "poor mobile optimization"]'::jsonb),
  ('https://competitor.com.au/seo-services', 82, '["weak meta descriptions", "low mobile optimization", "insufficient Australian keywords"]'::jsonb),
  ('https://australianmade.com.au', 85, '["limited local keywords", "could improve content length"]'::jsonb),
  ('https://localproducts.com.au', 80, '["poor content structure", "missing schema markup"]'::jsonb),
  ('https://digitalagency.com.au', 75, '["keyword stuffing", "poor readability score"]'::jsonb)
ON CONFLICT (url) DO UPDATE SET
  avg_score = EXCLUDED.avg_score,
  gaps = EXCLUDED.gaps,
  last_analyzed = CURRENT_TIMESTAMP;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to seo_analysis
DROP TRIGGER IF EXISTS update_seo_analysis_updated_at ON seo_analysis;
CREATE TRIGGER update_seo_analysis_updated_at
    BEFORE UPDATE ON seo_analysis
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions
GRANT ALL PRIVILEGES ON TABLE seo_analysis TO n8nuser;
GRANT ALL PRIVILEGES ON TABLE competitor_analysis TO n8nuser;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO n8nuser;
EOF

echo "📝 Created SQL setup script: $SQL_FILE"
echo ""

# Execute SQL
echo "Executing SQL setup..."
if command -v psql &> /dev/null; then
    # Try with sudo -u postgres first
    if sudo -u postgres psql -d "$DB_NAME" -f "$SQL_FILE" 2>/dev/null; then
        echo "✅ Database setup complete (via postgres user)"
    # Try with current user credentials
    elif PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$SQL_FILE" 2>/dev/null; then
        echo "✅ Database setup complete (via $DB_USER)"
    else
        echo "❌ Failed to execute SQL. Manual setup required:"
        echo ""
        echo "Run this command manually:"
        echo "  sudo -u postgres psql -d $DB_NAME -f $SQL_FILE"
        echo ""
        echo "Or if you have password:"
        echo "  PGPASSWORD=yourpassword psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $SQL_FILE"
        exit 1
    fi
else
    echo "⚠️  psql not found. Manual SQL execution required:"
    echo ""
    cat "$SQL_FILE"
    echo ""
    exit 1
fi

# Verify tables
echo ""
echo "🔍 Verifying tables..."

VERIFY_SQL="SELECT
  (SELECT COUNT(*) FROM seo_analysis) as seo_count,
  (SELECT COUNT(*) FROM competitor_analysis) as competitor_count;"

if sudo -u postgres psql -d "$DB_NAME" -t -c "$VERIFY_SQL" 2>/dev/null; then
    echo "✅ Tables created successfully"
elif PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -t -c "$VERIFY_SQL" 2>/dev/null; then
    echo "✅ Tables verified"
fi

echo ""
echo "📊 Database setup summary:"
echo "  • seo_analysis table: ✅"
echo "  • competitor_analysis table: ✅"
echo "  • Indexes created: ✅"
echo "  • Seed data loaded: ✅"
echo "  • Triggers configured: ✅"

echo ""
echo "✅ Database setup complete!"
echo ""
echo "To verify manually:"
echo "  sudo -u postgres psql -d $DB_NAME -c '\\dt'"
echo "  sudo -u postgres psql -d $DB_NAME -c 'SELECT * FROM competitor_analysis;'"
