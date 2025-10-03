import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const db = new Database(join(__dirname, 'rank-tracker.db'));

// Enable WAL mode for better concurrent performance
db.pragma('journal_mode = WAL');

// Initialize database schema
function initializeDatabase() {
  // Rank checks table - stores all historical rank checks
  db.exec(`
    CREATE TABLE IF NOT EXISTS rank_checks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL,
      keyword TEXT NOT NULL,
      location TEXT NOT NULL,
      rank INTEGER,
      found BOOLEAN NOT NULL,
      result_title TEXT,
      result_link TEXT,
      result_snippet TEXT,
      total_results INTEGER,
      checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create indexes for faster queries
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_domain_keyword ON rank_checks(domain, keyword);
    CREATE INDEX IF NOT EXISTS idx_checked_at ON rank_checks(checked_at);
    CREATE INDEX IF NOT EXISTS idx_domain_keyword_location ON rank_checks(domain, keyword, location);
  `);

  console.log('✅ Database initialized successfully');
}

// Initialize on first run
initializeDatabase();

// Save a rank check result
export function saveRankCheck(data) {
  const stmt = db.prepare(`
    INSERT INTO rank_checks (
      domain, keyword, location, rank, found,
      result_title, result_link, result_snippet, total_results
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.domain,
    data.keyword,
    data.location,
    data.rank,
    data.found ? 1 : 0,
    data.result?.title || null,
    data.result?.link || null,
    data.result?.snippet || null,
    data.totalResults
  );

  return result.lastInsertRowid;
}

// Get rank history for a domain + keyword combination
export function getRankHistory(domain, keyword, location = null, limit = 30) {
  let query = `
    SELECT
      id, domain, keyword, location, rank, found,
      result_title, result_link, result_snippet,
      checked_at, created_at
    FROM rank_checks
    WHERE domain = ? AND keyword = ?
  `;

  const params = [domain, keyword];

  if (location) {
    query += ` AND location = ?`;
    params.push(location);
  }

  query += ` ORDER BY checked_at DESC LIMIT ?`;
  params.push(limit);

  const stmt = db.prepare(query);
  return stmt.all(...params);
}

// Get unique tracked keywords for a domain
export function getTrackedKeywords(domain, limit = 50) {
  const stmt = db.prepare(`
    SELECT
      keyword,
      location,
      COUNT(*) as check_count,
      MAX(checked_at) as last_checked,
      (SELECT rank FROM rank_checks rc2
       WHERE rc2.domain = rc1.domain
       AND rc2.keyword = rc1.keyword
       AND rc2.location = rc1.location
       ORDER BY checked_at DESC LIMIT 1) as latest_rank
    FROM rank_checks rc1
    WHERE domain = ?
    GROUP BY keyword, location
    ORDER BY last_checked DESC
    LIMIT ?
  `);

  return stmt.all(domain, limit);
}

// Get rank comparison (first check vs latest check)
export function getRankComparison(domain, keyword, location = null) {
  let query = `
    WITH first_check AS (
      SELECT rank, checked_at
      FROM rank_checks
      WHERE domain = ? AND keyword = ?
  `;

  let params = [domain, keyword];

  if (location) {
    query += ` AND location = ?`;
    params.push(location);
  }

  query += `
      ORDER BY checked_at ASC LIMIT 1
    ),
    latest_check AS (
      SELECT rank, checked_at
      FROM rank_checks
      WHERE domain = ? AND keyword = ?
  `;

  params.push(domain, keyword);

  if (location) {
    query += ` AND location = ?`;
    params.push(location);
  }

  query += `
      ORDER BY checked_at DESC LIMIT 1
    )
    SELECT
      f.rank as first_rank,
      f.checked_at as first_checked,
      l.rank as latest_rank,
      l.checked_at as latest_checked,
      (f.rank - l.rank) as rank_change
    FROM first_check f, latest_check l
  `;

  const stmt = db.prepare(query);
  return stmt.get(...params);
}

// Clean up old records (optional - keep last 90 days)
export function cleanupOldRecords(daysToKeep = 90) {
  const stmt = db.prepare(`
    DELETE FROM rank_checks
    WHERE checked_at < datetime('now', '-' || ? || ' days')
  `);

  const result = stmt.run(daysToKeep);
  console.log(`🗑️ Cleaned up ${result.changes} old records`);
  return result.changes;
}

// Get database statistics
export function getStats() {
  const totalChecks = db.prepare('SELECT COUNT(*) as count FROM rank_checks').get();
  const uniqueDomains = db.prepare('SELECT COUNT(DISTINCT domain) as count FROM rank_checks').get();
  const uniqueKeywords = db.prepare('SELECT COUNT(DISTINCT keyword) as count FROM rank_checks').get();
  const oldestCheck = db.prepare('SELECT MIN(checked_at) as date FROM rank_checks').get();
  const latestCheck = db.prepare('SELECT MAX(checked_at) as date FROM rank_checks').get();

  return {
    totalChecks: totalChecks.count,
    uniqueDomains: uniqueDomains.count,
    uniqueKeywords: uniqueKeywords.count,
    oldestCheck: oldestCheck.date,
    latestCheck: latestCheck.date
  };
}

export default db;
