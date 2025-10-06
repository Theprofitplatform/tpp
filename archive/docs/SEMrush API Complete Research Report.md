<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# SEMrush API Complete Research Report

## Overview

SEMrush provides comprehensive APIs for accessing their vast database of SEO, competitive intelligence, and digital marketing data. The API system consists of two main versions with different authentication methods and capabilities, designed for businesses, agencies, and developers who need programmatic access to SEMrush's data.

## API Versions and Authentication

### API Version 3 (Current Standard)

Version 3 is the more mature and comprehensive API with the following characteristics:[^1_1]

- **Authentication**: Uses API key-based authentication
- **Stability**: No major changes - only additions are made, never deletions
- **Coverage**: Most extensive feature set currently available
- **Response Format**: Returns data in CSV format for Analytics/Trends APIs, JSON for Projects API


### API Version 4 (Latest Development)

Version 4 is the newer API version under active development:[^1_1]

- **Authentication**: OAuth 2.0 flow support
- **Features**: Unified authentication and response format
- **Backward Compatibility**: Maintains compatibility with existing implementations
- **Response Format**: JSON for all methods
- **Development Status**: Actively expanding functionality


## Authentication Methods

### API Key Authentication (Version 3)

To obtain your API key:[^1_2]

1. Log into your SEMrush account
2. Navigate to **Subscription info** > **API Units** tab
3. Copy your API key from the dashboard
4. Use in requests as: `key=YOUR_API_KEY`

**Security Note**: Never share your API key publicly. Exposed credentials can lead to account compromise and unexpected charges.[^1_3]

### OAuth 2.0 Authentication (Version 4)

SEMrush API v4 supports two OAuth 2.0 flows:[^1_4]

#### Device Authorization Grant Flow (Recommended)

```
POST https://oauth.semrush.com/dag/device/code
```

Response includes:

- `device_code`: Used for polling token endpoint
- `user_code`: Short code for sign-in
- `verification_uri`: URL for authorization
- `expires_in`: Code expiration time
- `interval`: Recommended polling interval


#### Standard Semrush Auth Flow

Requires contacting SEMrush Customer Support for `client_id` and `client_secret` credentials.[^1_4]

## API Options and Subscription Requirements

### Standard API

**Requirements**: Business subscription (\$499/month) + API units purchase[^1_5][^1_6]
**Includes**:

- Analytics API (Domain, Keyword, Backlink analytics)
- Projects API (Position Tracking, Site Audit)


### Trends API

**Two subscription levels**:[^1_7]

- **Trends Basic API**: Website traffic metrics and user behavior data
- **Trends Premium API**: All Basic features + 16 additional data types
- **Rate Limit**: 10,000 requests/month included by default
- **Note**: Uses separate unit system from Standard API


### Additional APIs

- **Listing Management API**: For Local Premium plan users
- **Map Rank Tracker API**: Geographic ranking data


## API Endpoints and Reports

### Analytics API - Domain Reports

**Authentication**: API key required
**Response Format**: CSV
**Unit Costs**: Vary by report type (10-200 units per line)

#### Core Domain Reports:[^1_3]

1. **Domain Organic Search Keywords** (`domain_organic`) - 10 units/line
2. **Domain Paid Search Keywords** (`domain_adwords`) - 20 units/line
3. **Competitors in Organic Search** (`domain_organic_organic`) - 40 units/line
4. **Competitors in Paid Search** (`domain_adwords_adwords`) - 40 units/line
5. **Domain Ad History** (`domain_adwords_historical`) - 100 units/line
6. **Domain vs. Domain** (`domain_domains`) - 80 units/line
7. **Domain PLA Search Keywords** (`domain_shopping`) - 30 units/line
8. **Domain Organic Pages** (`domain_organic_unique`) - 10 units/line
9. **Domain Organic Subdomains** (`domain_organic_subdomains`) - 10 units/line

### Analytics API - Keyword Reports[^1_8]

1. **Keyword Overview (all databases)** (`phrase_all`) - 10 units/line
2. **Keyword Overview (one database)** (`phrase_this`) - 10 units/line
3. **Batch Keyword Overview** (`phrase_these`) - 10 units/line
4. **Organic Results** (`phrase_organic`) - 10 units/line
5. **Paid Results** (`phrase_adwords`) - 20 units/line
6. **Related Keywords** (`phrase_related`) - 40 units/line
7. **Broad Match Keywords** (`phrase_fullsearch`) - 20 units/line
8. **Phrase Questions** (`phrase_questions`) - 40 units/line
9. **Keyword Difficulty** (`phrase_kdi`) - 50 units/line

### Analytics API - Backlink Reports[^1_3]

1. **Backlinks Overview** (`backlinks_overview`) - 40 units/request
2. **Backlinks** (`backlinks`) - 40 units/line
3. **Referring Domains** (`backlinks_refdomains`) - 40 units/line
4. **Referring IPs** (`backlinks_refips`) - 40 units/line
5. **TLD Distribution** (`backlinks_tld`) - 40 units/line
6. **Referring Domains by Country** (`backlinks_geo`) - 40 units/line
7. **Anchors** (`backlinks_anchors`) - 40 units/line
8. **Indexed Pages** (`backlinks_pages`) - 40 units/line
9. **Competitors** (`backlinks_competitors`) - 40 units/line
10. **Comparison by Referring Domains** (`backlinks_matrix`) - 40 units/line

### Projects API

**Available in both Version 3 and Version 4**
**Features**:

- Position Tracking campaign management
- Site Audit functionality
- Project creation, editing, and deletion
- Historical ranking data


### Trends API

**Response Format**: CSV
**Features**:

- Website traffic estimates
- Audience behavior data
- Market analysis
- Competitor traffic insights


## Request Format and Parameters

### Base URL

```
https://api.semrush.com/
```


### Essential Parameters

- `type`: Report type (e.g., `domain_organic`, `phrase_this`)
- `key`: Your API key
- `domain`/`phrase`: Target domain or keyword
- `database`: Regional database (e.g., `us`, `uk`, `de`)


### Common Optional Parameters[^1_3]

- `export_columns`: Specify which data columns to return
- `display_limit`: Limit number of results (max 100,000)
- `display_offset`: Skip specified number of results
- `display_sort`: Sort results by column (asc/desc)
- `display_filter`: Apply filters to data
- `display_date`: Historical data date (YYYYMM15 format)


### Example Request

```
https://api.semrush.com/?type=domain_organic&key=YOUR_API_KEY&domain=example.com&database=us&export_columns=Ph,Po,Nq,Cp,Ur&display_limit=100
```


## Response Format and Data Structure

### CSV Response Format (Analytics API v3)

The Analytics API returns data in CSV format with semicolon delimiters:[^1_9][^1_10]

```csv
Keyword;Position;Search Volume;CPC;URL
seo;9;110000;14.82;http://www.example.com/
marketing;15;45000;8.50;http://www.example.com/marketing
```


### JSON Response Format (Projects API v3, All v4 APIs)

```json
{
  "total": 199,
  "visibility": 15.9602,
  "all": 146,
  "data": {
    "0": {"keyword": "seo", "position": 9},
    "1": {"keyword": "marketing", "position": 15}
  }
}
```


### Available Data Columns

The API supports over 100+ different data columns. Key columns include:[^1_3]

**Domain Analytics**:

- `Dn`: Domain name
- `Or`: Organic keywords count
- `Ot`: Organic traffic estimate
- `Oc`: Organic traffic cost
- `Ad`: Paid keywords count
- `At`: Paid traffic estimate
- `Ac`: Paid traffic cost

**Keyword Analytics**:

- `Ph`: Keyword phrase
- `Nq`: Search volume
- `Cp`: Cost per click
- `Co`: Competition level
- `Kd`: Keyword difficulty
- `Nr`: Number of results

**Backlink Analytics**:

- `ascore`: Authority Score
- `domains_num`: Number of referring domains
- `backlinks_num`: Total backlinks
- `follows_num`: Follow links
- `nofollows_num`: NoFollow links


## Pricing and API Units

### Unit Consumption Model

SEMrush uses an API unit system where different reports consume different amounts of units:[^1_11]

**Cost Structure**:

- **Per-line reports**: Consume units based on data returned (e.g., Domain reports)
- **Per-request reports**: Fixed cost regardless of results (e.g., Backlinks overview)
- **Historical data**: Costs 5x more than regular data


### Pricing Examples[^1_12][^1_11]

- **Business Plan**: \$499/month + 1 million API units included
- **Additional Units**: ~\$100/month for 2 million additional units
- **Historical Data**: 50 units per keyword vs. 10 units for current data


### Cost Calculation Example[^1_11]

For 50 domains with 500 keywords each:

- **Regular data**: 500 × 10 units × 50 domains = 250,000 units
- **Historical data**: 500 × 50 units × 50 domains = 1,250,000 units
- **Total**: 1,500,000 units required


## Rate Limits and Performance

### Standard API Rate Limits[^1_6][^1_13]

- **Maximum**: 10 requests per second per IP address
- **Recommendation**: Implement request spacing to avoid throttling
- **Error Handling**: Implement retry logic for rate limit errors


### Best Practices for Rate Limiting[^1_13]

1. **Batch Requests**: Use `display_limit` parameter to control data volume
2. **Request Spacing**: Spread requests over time rather than burst calls
3. **Error Handling**: Implement exponential backoff for 429 errors
4. **Monitoring**: Track API unit consumption to avoid overages

## Regional Database Coverage

SEMrush provides data for 140+ countries and regions. Key databases include:[^1_1]

**Major Markets**:

- `us`: United States (google.com)
- `uk`: United Kingdom (google.co.uk)
- `de`: Germany (google.de)
- `fr`: France (google.fr)
- `ca`: Canada (google.ca)
- `au`: Australia (google.com.au)

**Database Types**:

- **Desktop**: Two-letter code (e.g., `us`)
- **Mobile**: With `mobile-` prefix (e.g., `mobile-us`)
- **Extended**: With `-ext` suffix (e.g., `us-ext`)


## Error Handling and Troubleshooting

### Common Error Codes[^1_14]

- **ERROR 135**: API report type disabled - Update to newer endpoint format
- **403 Forbidden**: Invalid API key or insufficient permissions
- **429 Too Many Requests**: Rate limit exceeded
- **400 Bad Request**: Invalid parameters or format


### Error Resolution[^1_14]

**Legacy Endpoint Issues**:
Old format: `http://us.api.semrush.com/?action=report&type=phrase_this`
New format: `http://api.semrush.com/?type=phrase_this&database=us`

### Best Practices for Error Handling

1. **Validate API Key**: Ensure key is active and has sufficient units
2. **Check Parameters**: Verify all required parameters are included
3. **Monitor Unit Balance**: Track consumption to avoid unexpected exhaustion
4. **Implement Retries**: Use exponential backoff for temporary failures

## Data Processing and Integration

### CSV Data Processing[^1_15][^1_10]

Since SEMrush returns CSV data with semicolon delimiters, special processing is required:

**Python Example**:

```python
import requests
import csv
from io import StringIO

response = requests.get('https://api.semrush.com/?type=domain_organic&key=API_KEY&domain=example.com&database=us')
csv_data = StringIO(response.text)
reader = csv.reader(csv_data, delimiter=';')
```

**Google Sheets Integration**:[^1_16]

```
=IMPORTDATA("https://api.semrush.com/?type=backlinks_overview&key=YOUR_API_KEY&target=example.com&target_type=root_domain",";")
```


### JSON Processing (Projects API)

```python
import json
response = requests.get('https://api.semrush.com/reports/v1/projects/ID/tracking/campaign/dates?key=API_KEY')
data = response.json()
```


## Advanced Features and Use Cases

### Historical Data Analysis

SEMrush provides historical data dating back to 2012 for SEO data and 2017 for Traffic data:[^1_1]

- **Monthly Granularity**: For long-term trend analysis
- **Daily Granularity**: Available for last 31 days (organic keywords)
- **Cost Factor**: Historical data costs 5x regular data


### SERP Features Tracking[^1_17]

The API tracks 25+ SERP features including:

- Featured snippets (`fsn`)
- Local pack (`geo`)
- Knowledge panel (`kng`)
- People also ask (`rel`)
- AI Overview (`aio`)
- Shopping ads (`shp`)


### Competitor Analysis Workflows

1. **Identify Competitors**: Use `domain_organic_organic` endpoint
2. **Keyword Gap Analysis**: Compare domains with `domain_domains`
3. **Backlink Gap Analysis**: Use `backlinks_competitors`
4. **Traffic Estimation**: Leverage Trends API for traffic insights

## Implementation Requirements

### Technical Prerequisites

1. **SEMrush Business Subscription**: \$499/month minimum
2. **API Units**: Purchased separately based on usage needs
3. **Development Environment**: Support for HTTP requests and CSV/JSON parsing
4. **Error Handling**: Robust retry and fallback mechanisms

### Security Considerations

1. **API Key Protection**: Store securely, never expose in client-side code
2. **Rate Limiting**: Implement proper throttling to avoid IP blocks
3. **Data Storage**: Consider data retention policies for cached results
4. **Access Control**: Limit API key access to authorized systems only

### Scalability Planning

1. **Unit Consumption Monitoring**: Track usage patterns and optimize requests
2. **Caching Strategy**: Cache frequently accessed data to reduce API calls
3. **Batch Processing**: Group requests efficiently to maximize throughput
4. **Infrastructure**: Plan for request volume and response processing capacity

This comprehensive analysis provides all the essential information needed to successfully implement and integrate with the SEMrush API. The API offers extensive capabilities for SEO analysis, competitive intelligence, and digital marketing insights, with robust authentication, detailed documentation, and flexible pricing models to support various business needs.
<span style="display:none">[^1_18][^1_19][^1_20][^1_21][^1_22][^1_23][^1_24][^1_25][^1_26][^1_27][^1_28][^1_29][^1_30][^1_31][^1_32][^1_33][^1_34][^1_35][^1_36][^1_37][^1_38][^1_39][^1_40][^1_41][^1_42][^1_43][^1_44][^1_45][^1_46][^1_47][^1_48][^1_49][^1_50][^1_51][^1_52][^1_53][^1_54][^1_55][^1_56]</span>

<div align="center">⁂</div>

[^1_1]: https://developer.semrush.com/api/basics/introduction/

[^1_2]: https://developer.semrush.com/api/basics/get-started/

[^1_3]: https://www.youtube.com/watch?v=yoYn0kLyXXw

[^1_4]: https://developer.semrush.com/api/v4/basic-docs/

[^1_5]: https://www.semrush.com/kb/5-api

[^1_6]: https://rollout.com/integration-guides/semrush/api-essentials

[^1_7]: https://www.semrush.com/kb/930-trends-api

[^1_8]: https://developer.semrush.com/api/v3/analytics/keyword-reports/

[^1_9]: https://stackoverflow.com/questions/47202802/handling-csv-response-from-semrush-to-json-using-python

[^1_10]: https://www.humanlevel.com/en/blog/seo/how-to-use-semrush-api

[^1_11]: https://developer.semrush.com/api/basics/api-units-balance/

[^1_12]: https://www.reddit.com/r/SEMrush/comments/1hvvwkr/how_much_does_2_million_api_unit_package_cost/

[^1_13]: https://www.vocso.com/blog/automating-seo-reporting-with-semrush-api-and-custom-scripts/

[^1_14]: https://stackoverflow.com/questions/40676748/semrush-api-error-135-api-report-type-disabled

[^1_15]: https://github.com/ozcontent/node-semrush-api

[^1_16]: https://lavall.marketing/api/semrush-api-data-in-google-sheets-for-domain-backlink-insights/

[^1_17]: https://www.semrush.com/kb/986-api-serp-features

[^1_18]: https://developer.semrush.com/api/v3/analytics/basic-docs/

[^1_19]: https://blog.creddy.me/semrush-api-key-generate-tutorial-2

[^1_20]: https://apps.make.com/semrush

[^1_21]: https://www.femaleswitch.com/ai-seo-tool/tpost/0btpj2l0y1-comprehensive-guide-to-using-the-semrush

[^1_22]: https://docs.datavirtuality.com/connectors/semrush-api-information

[^1_23]: https://aicontentfy.com/en/blog/how-to-harness-power-of-semrush-api-for-seo-success

[^1_24]: https://developer.semrush.com/api/basics/how-to-get-api/

[^1_25]: https://rollout.com/integration-guides/semrush/sdk/step-by-step-guide-to-building-a-semrush-api-integration-in-python

[^1_26]: https://www.semrush.com/kb/1130-security

[^1_27]: https://developer.semrush.com/api/

[^1_28]: https://docs.supermetrics.com/docs/semrush-analytics-connection-guide

[^1_29]: https://developer.semrush.com

[^1_30]: https://www.semrush.com/kb/

[^1_31]: https://trafficthinktank.com/semrush-pricing/

[^1_32]: https://www.semrush.com/kb/1011-subscriptions

[^1_33]: https://www.reddit.com/r/shopify/comments/1akcvxc/rate_limiting_at_our_office_and_now_our_customers/

[^1_34]: https://developer.semrush.com/api/basics/faq/

[^1_35]: https://community.clay.com/x/support/5da8nmdzu67v/struggling-with-semrush-api-integration-for-table-

[^1_36]: https://www.semrush.com/pricing/

[^1_37]: https://metehan.ai/blog/semrush-mcp/

[^1_38]: https://static.semrush.com/blog/uploads/files/34/ae/34ae0601e3aeaec30bbda1fd3bad7885/traffic_analytics-api.pdf

[^1_39]: https://apipheny.io/semrush-api/

[^1_40]: https://developer.semrush.com/api/v4/projects/v0084/

[^1_41]: https://developer.semrush.com/api/v3/projects/projects/

[^1_42]: https://developer.semrush.com/api/v3/projects/position-tracking/

[^1_43]: https://www.postman.com/postman/postman-team-collections/documentation/r2v44im/seo-apis-and-tools

[^1_44]: https://developer.semrush.com/api/v3/projects/basic-docs/

[^1_45]: https://docs.dataddo.com/docs/semrush

[^1_46]: https://pipedream.com/apps/semrush/integrations/python

[^1_47]: https://developer.semrush.com/api/basics/semrush-mcp/

[^1_48]: https://github.com/storerjeremy/python-semrush

[^1_49]: https://aicontentfy.com/en/blog/common-semrush-issues-and-how-to-troubleshoot-them

[^1_50]: https://developer.semrush.com/api/basics/use-cases/

[^1_51]: https://www.semrush.com/blog/python-for-google-search/

[^1_52]: https://www.semrush.com/blog/http-status-codes/

[^1_53]: https://developer.semrush.com/api/v3/projects/site-audit/

[^1_54]: https://developer.semrush.com/api/v3/trends/welcome-to-trends-api/

[^1_55]: https://www.semrush.com/kb/681-site-audit-troubleshooting

[^1_56]: https://developer.semrush.com/api/v3/trends/api-reference/

