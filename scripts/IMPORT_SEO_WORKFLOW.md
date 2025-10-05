# Import Advanced SEO Workflow to n8n

## Quick Import via n8n UI

### Method 1: Web Interface (Recommended)

1. **Access n8n**:
   ```
   https://n8n.theprofitplatform.com.au
   ```

2. **Import Workflow**:
   - Click "**+**" (Add Workflow) in top-left
   - Click "**Import from File**"
   - Select: `/home/avi/projects/astro-site/n8n-workflows/advanced-seo-optimization-workflow.json`
   - Click "**Import**"

3. **Configure Credentials**:

   **PostgreSQL Connection**:
   - Click on "Fetch Competitor Data" node
   - Click "**Select Credential**" → "**Create New**"
   - Add your PostgreSQL credentials:
     ```
     Host: localhost (or your DB host)
     Database: your_database_name
     User: your_db_user
     Password: your_db_password
     Port: 5432
     ```
   - Name it: "PostgreSQL - Main DB"
   - Save

   - Repeat for "Store Analysis in DB" node (use same credential)

   **SMTP/Email Configuration**:
   - Click on "Send Email Report" node
   - Click "**Select Credential**" → "**Create New**"
   - Add your SMTP settings:
     ```
     Host: smtp.gmail.com (or your SMTP server)
     Port: 587 (or 465 for SSL)
     User: your-email@domain.com
     Password: your-app-password
     ```
   - Name it: "SMTP - TPP"
   - Save

4. **Activate Workflow**:
   - Click "**Save**" (top-right)
   - Toggle "**Active**" switch (top-right)

5. **Get Webhook URL**:
   - Click on "Webhook - SEO Request" node
   - Copy the "Test URL" or "Production URL"
   - Should be: `https://n8n.theprofitplatform.com.au/webhook/seo-optimization`

### Method 2: CLI Import (Alternative)

```bash
# From project root
cd /home/avi/projects/astro-site

# Copy workflow to n8n workflows directory
curl -X POST https://n8n.theprofitplatform.com.au/api/v1/workflows \
  -H "Content-Type: application/json" \
  -H "X-N8N-API-KEY: YOUR_API_KEY" \
  -d @n8n-workflows/advanced-seo-optimization-workflow.json
```

## Database Setup

The workflow requires two PostgreSQL tables:

### 1. Create SEO Analysis Table

```sql
CREATE TABLE IF NOT EXISTS seo_analysis (
  id SERIAL PRIMARY KEY,
  content_id VARCHAR(255) NOT NULL,
  seo_score INTEGER NOT NULL,
  analysis_data JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seo_content_id ON seo_analysis(content_id);
CREATE INDEX idx_seo_score ON seo_analysis(seo_score);
CREATE INDEX idx_seo_created_at ON seo_analysis(created_at DESC);
```

### 2. Create Competitor Analysis Table (Optional)

```sql
CREATE TABLE IF NOT EXISTS competitor_analysis (
  id SERIAL PRIMARY KEY,
  url VARCHAR(512) NOT NULL UNIQUE,
  avg_score INTEGER,
  gaps JSONB,
  last_analyzed TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_competitor_url ON competitor_analysis(url);
```

### 3. Seed Sample Competitor Data

```sql
INSERT INTO competitor_analysis (url, avg_score, gaps) VALUES
  ('https://example.com/digital-marketing', 78, '["lacks long-tail keywords", "missing H2 headings"]'::jsonb),
  ('https://competitor.com.au/seo-services', 82, '["weak meta descriptions", "low mobile optimization"]'::jsonb),
  ('https://australianmade.com.au', 85, '["limited local keywords"]'::jsonb),
  ('https://localproducts.com.au', 80, '["poor content structure"]'::jsonb)
ON CONFLICT (url) DO NOTHING;
```

## Ollama Model Setup

The workflow uses Ollama models. Ensure they're available:

```bash
# Check Ollama is running
curl http://localhost:11434/api/tags

# Pull required models if needed
ollama pull mistral:7b
ollama pull llama3.2:1b
```

## Testing the Workflow

### 1. Run Test Suite

```bash
cd /home/avi/projects/astro-site

# Run all tests
node scripts/test-seo-workflow.cjs

# Run specific test
node scripts/test-seo-workflow.cjs 0  # High-quality content
node scripts/test-seo-workflow.cjs 1  # Low-quality (triggers optimization)
```

### 2. Manual cURL Test

```bash
curl -X POST https://n8n.theprofitplatform.com.au/webhook/seo-optimization \
  -H "Content-Type: application/json" \
  -d '{
    "content_id": "manual-test-001",
    "title": "Digital Marketing Services Australia",
    "content": "Expert digital marketing for Australian businesses. SEO, PPC, and social media marketing.",
    "keywords": ["digital marketing", "SEO Australia", "marketing services"],
    "competitor_urls": ["https://example.com/marketing"],
    "target_location": "Australia"
  }'
```

## Workflow Features Summary

✅ **11 Nodes Total**:
1. Webhook Trigger (POST /seo-optimization)
2. Input Validation & Parsing
3. Content SEO Analysis (Mistral 7B) - **Parallel**
4. Keyword Research (Llama3.2 1B) - **Parallel**
5. Competitor Data Fetch (PostgreSQL) - **Parallel**
6. Merge All Analysis
7. Compile SEO Report & Score (0-100)
8. Conditional: Score < 80?
9. AI Content Optimization (if needed)
10. Store Analysis in Database
11. Send Email Report
12. Webhook Response

✅ **Key Features**:
- Parallel AI processing (3 simultaneous analyses)
- Auto-optimization when score < 80
- Australian SEO focus
- Competitor insights from database
- Email reports with HTML formatting
- JSON response with full analysis

## Troubleshooting

### Issue: "Webhook not registered for POST"
**Solution**: Ensure workflow is Active and saved

### Issue: "Ollama connection error"
**Solution**:
```bash
# Start Ollama if not running
ollama serve

# Or restart the service
sudo systemctl restart ollama
```

### Issue: "PostgreSQL connection failed"
**Solution**: Check credentials in n8n settings, verify database is running

### Issue: "Email not sending"
**Solution**:
- Verify SMTP credentials
- Check if using App Password (for Gmail)
- Test SMTP connection: `telnet smtp.gmail.com 587`

## Monitoring

### Check Workflow Executions

1. Go to n8n UI → "Executions" tab
2. Filter by workflow name
3. Review success/failure rates
4. Inspect individual execution logs

### Database Queries

```sql
-- Recent SEO analyses
SELECT content_id, seo_score, created_at
FROM seo_analysis
ORDER BY created_at DESC
LIMIT 10;

-- Average SEO scores by date
SELECT DATE(created_at) as date, AVG(seo_score) as avg_score
FROM seo_analysis
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Low-scoring content that needs optimization
SELECT content_id, seo_score, analysis_data->>'recommendations' as recommendations
FROM seo_analysis
WHERE seo_score < 80
ORDER BY seo_score ASC;
```

## Next Steps

1. ✅ Import workflow to n8n
2. ✅ Configure credentials (PostgreSQL, SMTP)
3. ✅ Set up database tables
4. ✅ Activate workflow
5. ✅ Run test suite
6. 📊 Monitor results and optimize

## Support

- n8n Docs: https://docs.n8n.io
- Ollama Docs: https://ollama.ai/docs
- Project Issues: Contact avi@theprofitplatform.com.au
