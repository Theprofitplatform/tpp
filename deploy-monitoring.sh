#!/bin/bash

# Deploy monitoring stack to VPS

echo "🚀 Deploying comprehensive monitoring stack..."

# Transfer monitoring configuration to VPS
ssh tpp-vps "cd ~/projects/tpp && mkdir -p .automation/monitoring && cat > .automation/monitoring/docker-compose.yml << 'MONITORING_EOF'
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: tpp-prometheus
    ports:
      - \"9090:9090\"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    restart: unless-stopped
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: tpp-grafana
    ports:
      - \"3001:3000\"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/dashboards:/etc/grafana/provisioning/dashboards
      - ./grafana/datasources:/etc/grafana/provisioning/datasources
    restart: unless-stopped
    networks:
      - monitoring

  node-exporter:
    image: prom/node-exporter:latest
    container_name: tpp-node-exporter
    ports:
      - \"9100:9100\"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    restart: unless-stopped
    networks:
      - monitoring

  alertmanager:
    image: prom/alertmanager:latest
    container_name: tpp-alertmanager
    ports:
      - \"9093:9093\"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    restart: unless-stopped
    networks:
      - monitoring

  loki:
    image: grafana/loki:latest
    container_name: tpp-loki
    ports:
      - \"3100:3100\"
    volumes:
      - ./loki.yml:/etc/loki/local-config.yaml
      - loki_data:/loki
    command: -config.file=/etc/loki/local-config.yaml
    restart: unless-stopped
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:
  loki_data:

networks:
  monitoring:
    driver: bridge
MONITORING_EOF
echo '✅ Docker Compose configuration created'"

# Create Prometheus configuration
ssh tpp-vps "cd ~/projects/tpp/.automation/monitoring && cat > prometheus.yml << 'PROMETHEUS_EOF'
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - \"alert_rules.yml\"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']
    scrape_interval: 10s
    metrics_path: /metrics

  - job_name: 'tpp-backend'
    static_configs:
      - targets: ['172.17.0.1:4321']
    metrics_path: /api/metrics
    scrape_interval: 30s

  - job_name: 'automation-metrics'
    static_configs:
      - targets: ['172.17.0.1:4322']
    metrics_path: /metrics
    scrape_interval: 15s
PROMETHEUS_EOF
echo '✅ Prometheus configuration created'"

# Create Alertmanager configuration
ssh tpp-vps "cd ~/projects/tpp/.automation/monitoring && cat > alertmanager.yml << 'ALERTMANAGER_EOF'
global:
  smtp_smarthost: 'smtp.gmail.com:587'
  smtp_from: 'alerts@theprofitplatform.com.au'
  smtp_auth_username: 'abhishekmaharjan3737@gmail.com'
  smtp_auth_password: 'ylbsatvowjqmyyjl'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
  - match:
      severity: critical
    receiver: 'critical-alerts'
  - match:
      severity: warning
    receiver: 'warning-alerts'

receivers:
- name: 'web.hook'
  webhook_configs:
  - url: 'http://localhost:4323/webhooks/alerts'
    send_resolved: true

- name: 'critical-alerts'
  email_configs:
  - to: 'avi@theprofitplatform.com.au'
    subject: '🚨 CRITICAL: TPP System Alert'
    body: |
      {{ range .Alerts }}
      Alert: {{ .Annotations.summary }}
      Description: {{ .Annotations.description }}
      {{ end }}
  discord_configs:
  - webhook_url: 'https://discord.com/api/webhooks/your-webhook'
    title: '🚨 CRITICAL SYSTEM ALERT'
    message: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

- name: 'warning-alerts'
  discord_configs:
  - webhook_url: 'https://discord.com/api/webhooks/your-webhook'
    title: '⚠️ System Warning'
    message: '{{ range .Alerts }}{{ .Annotations.summary }}{{ end }}'

inhibit_rules:
- source_match:
    severity: 'critical'
  target_match:
    severity: 'warning'
  equal: ['alertname']
ALERTMANAGER_EOF
echo '✅ Alertmanager configuration created'"

# Create Loki configuration
ssh tpp-vps "cd ~/projects/tpp/.automation/monitoring && cat > loki.yml << 'LOKI_EOF'
auth_enabled: false

server:
  http_listen_port: 3100

ingester:
  lifecycler:
    address: 127.0.0.1
    ring:
      kvstore:
        store: inmemory
      replication_factor: 1
    final_sleep: 0s
  chunk_idle_period: 1h
  max_chunk_age: 1h
  chunk_target_size: 1048576
  chunk_retain_period: 30s

schema_config:
  configs:
    - from: 2020-10-24
      store: boltdb-shipper
      object_store: filesystem
      schema: v11
      index:
        prefix: index_
        period: 24h

storage_config:
  boltdb_shipper:
    active_index_directory: /loki/boltdb-shipper-active
    cache_location: /loki/boltdb-shipper-cache
    shared_store: filesystem
  filesystem:
    directory: /loki/chunks

limits_config:
  enforce_metric_name: false
  reject_old_samples: true
  reject_old_samples_max_age: 168h

chunk_store_config:
  max_look_back_period: 0s

table_manager:
  retention_deletes_enabled: false
  retention_period: 0s
LOKI_EOF
echo '✅ Loki configuration created'"

# Create alert rules
ssh tpp-vps "cd ~/projects/tpp/.automation/monitoring && cat > alert_rules.yml << 'RULES_EOF'
groups:
- name: system_alerts
  rules:
  - alert: HighDiskUsage
    expr: (node_filesystem_size_bytes{mountpoint=\"/\"} - node_filesystem_free_bytes{mountpoint=\"/\"}) / node_filesystem_size_bytes{mountpoint=\"/\"} * 100 > 85
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: \"High disk usage detected\"
      description: \"Disk usage is above 85% on {{ $labels.instance }}\"

  - alert: CriticalDiskUsage
    expr: (node_filesystem_size_bytes{mountpoint=\"/\"} - node_filesystem_free_bytes{mountpoint=\"/\"}) / node_filesystem_size_bytes{mountpoint=\"/\"} * 100 > 95
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: \"CRITICAL disk usage\"
      description: \"Disk usage is above 95% on {{ $labels.instance }}\"

  - alert: HighMemoryUsage
    expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 90
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: \"High memory usage\"
      description: \"Memory usage is above 90% on {{ $labels.instance }}\"

  - alert: CriticalMemoryUsage
    expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 95
    for: 2m
    labels:
      severity: critical
    annotations:
      summary: \"CRITICAL memory usage\"
      description: \"Memory usage is above 95% on {{ $labels.instance }}\"

  - alert: TPPBackendDown
    expr: up{job=\"tpp-backend\"} == 0
    for: 1m
    labels:
      severity: critical
    annotations:
      summary: \"TPP Backend is down\"
      description: \"TPP backend service is not responding\"

  - alert: OrchestratorDown
    expr: up{job=\"automation-metrics\"} == 0
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: \"Automation Orchestrator is down\"
      description: \"Central automation orchestrator is not responding\"

- name: workflow_alerts
  rules:
  - alert: WorkflowFailureRate
    expr: increase(automation_workflow_failures_total[5m]) > 3
    for: 2m
    labels:
      severity: warning
    annotations:
      summary: \"High workflow failure rate\"
      description: \"Multiple workflows failing in short time\"

  - alert: WorkflowTimeout
    expr: time() - automation_workflow_last_success_seconds > 3600
    for: 5m
    labels:
      severity: warning
    annotations:
      summary: \"Workflow timeout\"
      description: \"Workflow {{ $labels.workflow }} hasn't completed successfully in 1 hour\"
RULES_EOF
echo '✅ Alert rules created'"

# Create Grafana datasources
ssh tpp-vps "cd ~/projects/tpp/.automation/monitoring && mkdir -p grafana/{datasources,dashboards} && cat > grafana/datasources/prometheus.yml << 'GRAFANA_DS_EOF'
apiVersion: 1

datasources:
  - name: Prometheus
    type: prometheus
    access: proxy
    url: http://prometheus:9090
    isDefault: true
    jsonData:
      timeInterval: \"15s\"

  - name: Loki
    type: loki
    access: proxy
    url: http://loki:3100
    jsonData:
      maxLines: 1000
GRAFANA_DS_EOF
echo '✅ Grafana datasources configured'"

echo "✅ Monitoring stack deployment script prepared"
