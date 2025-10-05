<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> RSS Feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem 1rem;
            background: #f8f9fa;
          }
          .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
          }
          .header h1 { margin: 0 0 0.5rem 0; }
          .header p { margin: 0; opacity: 0.9; }
          .subscribe-info {
            background: #fff;
            padding: 1.5rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            border-left: 4px solid #667eea;
          }
          .subscribe-info strong { color: #667eea; }
          .item {
            background: white;
            padding: 1.5rem;
            margin-bottom: 1.5rem;
            border-radius: 8px;
            border: 1px solid #e2e8f0;
            transition: transform 0.2s;
          }
          .item:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          .item h2 {
            margin: 0 0 0.5rem 0;
            font-size: 1.5rem;
          }
          .item h2 a {
            color: #0f172a;
            text-decoration: none;
          }
          .item h2 a:hover { color: #667eea; }
          .item-meta {
            color: #64748b;
            font-size: 0.875rem;
            margin-bottom: 1rem;
          }
          .item-description {
            color: #475569;
            line-height: 1.7;
          }
          .category {
            display: inline-block;
            background: #ede9fe;
            color: #6d28d9;
            padding: 0.25rem 0.75rem;
            border-radius: 50px;
            font-size: 0.75rem;
            font-weight: 600;
            margin-right: 0.5rem;
          }
          code {
            background: #f1f5f9;
            padding: 0.125rem 0.375rem;
            border-radius: 3px;
            font-family: monospace;
            font-size: 0.875em;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p><xsl:value-of select="/rss/channel/description"/></p>
        </div>

        <div class="subscribe-info">
          <strong>📡 This is an RSS feed.</strong> Copy the URL from your browser's address bar and paste it into your RSS reader application. Popular RSS readers include Feedly, Inoreader, and NetNewsWire.
        </div>

        <xsl:for-each select="/rss/channel/item">
          <div class="item">
            <h2>
              <a>
                <xsl:attribute name="href">
                  <xsl:value-of select="link"/>
                </xsl:attribute>
                <xsl:value-of select="title"/>
              </a>
            </h2>
            <div class="item-meta">
              <xsl:if test="category">
                <span class="category"><xsl:value-of select="category"/></span>
              </xsl:if>
              <time>
                <xsl:value-of select="substring(pubDate, 0, 17)"/>
              </time>
            </div>
            <div class="item-description">
              <xsl:value-of select="description"/>
            </div>
          </div>
        </xsl:for-each>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
