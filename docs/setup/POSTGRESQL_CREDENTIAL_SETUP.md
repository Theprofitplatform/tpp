# PostgreSQL Credential Setup for n8n SEO Workflow

## Issue
The existing "Postgres account" credential is configured incorrectly, causing authentication failures.

## Solution: Create New Credential

### Connection Details Required:
- **Host:** `localhost` or `127.0.0.1`
- **Database:** `n8n`
- **User:** `postgres`
- **Password:** [Your PostgreSQL postgres user password]
- **Port:** `5432`
- **SSL Mode:** `disable` (for localhost connections)

### Step-by-Step Setup:

#### 1. Find PostgreSQL Password

If you don't know the postgres password, reset it:

```bash
# As root or with sudo
sudo -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'your_new_password';"
```

Or check if password is in environment/config files.

#### 2. Create Credential in n8n UI

1. Navigate to: https://n8n.theprofitplatform.com.au/credentials
2. Click **"Add Credential"**
3. Search and select **"Postgres"**
4. Fill in the form:
   ```
   Name: PostgreSQL - n8n Database
   Host: localhost
   Database: n8n
   User: postgres
   Password: [your postgres password]
   Port: 5432
   SSL: disable
   ```
5. Click **"Test Connection"** - should show success ✅
6. Click **"Save"**

#### 3. Update Workflow Nodes

The workflow has 2 PostgreSQL nodes that need the credential:

**Node 1: "Fetch Competitor Data"**
- Purpose: Queries `competitor_analysis` table
- SQL: `SELECT * FROM competitor_analysis WHERE url = ANY(ARRAY[...]) LIMIT 10`

**Node 2: "Store Analysis in DB"**
- Purpose: Inserts results into `seo_analysis` table
- Stores: content_id, seo_score, analysis_data, created_at

**To update:**
1. Open: https://n8n.theprofitplatform.com.au/workflow/fefa4ab2-72c7-4485-8356-e0eb7fd6a049
2. Click each PostgreSQL node
3. Select your new credential from dropdown
4. Save workflow

#### 4. Verify Tables Exist

The tables were created during setup:

```sql
-- Check tables exist
\dt

-- Verify seo_analysis structure
\d seo_analysis

-- Verify competitor_analysis structure
\d competitor_analysis
```

Both tables exist in the `n8n` database and are owned by `postgres` user.

## Alternative: Use Different Credentials

If you want to avoid using the `postgres` superuser:

### Option A: Create Dedicated n8n_seo User

```sql
-- As postgres user
CREATE USER n8n_seo WITH PASSWORD 'secure_password';
GRANT CONNECT ON DATABASE n8n TO n8n_seo;
GRANT SELECT, INSERT ON seo_analysis TO n8n_seo;
GRANT SELECT ON competitor_analysis TO n8n_seo;
GRANT USAGE, SELECT ON SEQUENCE seo_analysis_id_seq TO n8n_seo;
```

Then create credential in n8n with:
- User: `n8n_seo`
- Password: `secure_password`

### Option B: Use n8n Database User

Check if there's already an n8n database user:

```bash
sudo -u postgres psql -c "\du" | grep n8n
```

If exists, you could create credential with that user (if you know the password).

## Troubleshooting

### Error: "All configured authentication methods failed"

**Causes:**
1. Wrong password
2. Wrong database name
3. Wrong host/port
4. PostgreSQL not accepting connections from n8n

**Check PostgreSQL is running:**
```bash
sudo systemctl status postgresql
```

**Check PostgreSQL accepts local connections:**
```bash
sudo cat /etc/postgresql/*/main/pg_hba.conf | grep -E "local|127.0.0.1"
```

Should show:
```
local   all             all                                     peer
host    all             all             127.0.0.1/32            scram-sha-256
```

**Test connection from command line:**
```bash
psql -h localhost -U postgres -d n8n -c "SELECT 1;"
# Enter password when prompted
```

### Error: "Connection refused"

PostgreSQL might not be listening on the right interface:

```bash
sudo cat /etc/postgresql/*/main/postgresql.conf | grep listen_addresses
```

Should show:
```
listen_addresses = 'localhost'
```

If changed, restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

## Quick Test After Setup

Once credential is created, test it:

```sql
-- In n8n credential test or manually
SELECT COUNT(*) FROM seo_analysis;
SELECT COUNT(*) FROM competitor_analysis;
```

Should return 0 (tables are empty but accessible).

## Security Note

For production, create a dedicated user with minimal privileges instead of using the `postgres` superuser:

```sql
CREATE USER n8n_seo WITH PASSWORD 'strong_random_password';
GRANT CONNECT ON DATABASE n8n TO n8n_seo;
GRANT SELECT, INSERT ON seo_analysis TO n8n_seo;
GRANT SELECT ON competitor_analysis TO n8n_seo;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO n8n_seo;
```
