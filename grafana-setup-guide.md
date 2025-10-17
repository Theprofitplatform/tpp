# 🚀 Grafana Setup Guide for TPP Automation

## ✅ **PRE-REQUISITES COMPLETED**

### **1. Data Sources Configured**
- ✅ Prometheus data source: `http://prometheus:9090`
- ✅ Auto-discovery enabled
- ✮ Ready for dashboard creation

### **2. Metrics Available**
- ✅ System metrics (Node Exporter)
- ✅ Backend metrics (TPP Backend)
- ✅ Automation metrics (Orchestrator)
- ✅ Prometheus self-metrics

---

## 🔧 **GRAFANA DASHBOARD SETUP**

### **Step 1: Login to Grafana**
**URL:** http://31.97.222.218:3005  
**Username:** `admin`  
**Password:** `admin123`

### **Step 2: Verify Data Source**
1. Click **⚙️ Configuration** (gear icon) → **Data Sources**
2. Find **Prometheus** in the list
3. Click **Test Connection** 
4. Should show ✅ **Data source is working**

### **Step 3: Import Pre-built Dashboard**

#### **Option A: Quick Import (Recommended)**

1. Click **➕ Add** → **Import Dashboard**
2. Enter this dashboard ID: `8919` (Node Exporter Full)
3. Click **Load**
4. Select **Prometheus** as data source
5. Click **Import**

#### **Option B: Manual Dashboard Import**

Copy this JSON and import:

```json
{
  "dashboard": {
    "id": null,
    "title": "TPP Automation Platform",
    "tags": ["tpp", "automation"],
    "style": "dark",
    "timezone": "browser",
    "editable": true,
    "panels": [
      {
        "title": "System Status",
        "type": "stat",
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 0},
        "targets": [
          {"expr": "up{job=\"prometheus\"}", "legendFormat": "Prometheus"},
          {"expr": "up{job=\"node-exporter\"}", "legendFormat": "Node Exporter"},
          {"expr": "tpp_backend_up", "legendFormat": "TPP Backend"}
        ],
        "fieldConfig": {
          "defaults": {
            "mappings": [
              {"options": {"0": {"text": "DOWN", "color": "red"}, "1": {"text": "UP", "color": "green"}}}
            ]
          }
        }
      },
      {
        "title": "Memory Usage",
        "type": "graph",
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 0},
        "targets": [
          {"expr": "process_resident_memory_bytes / 1024 / 1024", "legendFormat": "Memory (MB)"}
        ]
      },
      {
        "title": "CPU Usage",
        "type": "graph",
        "gridPos": {"h": 8, "w": 24, "x": 0, "y": 8},
        "targets": [
          {"expr": "100 - (avg by(instance) (rate(node_cpu_seconds_total{mode=\"idle\"}[5m])) * 100)", "legendFormat": "CPU % - {{instance}}"}
        ]
      },
      {
        "title": "Backend Requests",
        "type": "graph",
        "gridPos": {"h": 8, "w": 12, "x": 0, "y": 16},
        "targets": [
          {"expr": "rate(tpp_backend_requests_total[5m])", "legendFormat": "{{method}} {{status}}"}
        ]
      },
      {
        "title": "Email Sent",
        "type": "stat",
        "gridPos": {"h": 8, "w": 12, "x": 12, "y": 16},
        "targets": [
          {"expr": "tpp_backend_email_sent_total", "legendFormat": "Total Emails"}
        ]
      }
    ],
    "time": {"from": "now-1h", "to": "now"},
    "refresh": "30s"
  }
}
```

---

## 📊 **AVAILABLE METRICS**

### **System Metrics**
- `node_cpu_seconds_total` - CPU usage
- `node_memory_MemAvailable_bytes` - Memory available  
- `node_filesystem_size_bytes` - Disk usage
- `node_load1`, `node_load5` - System load

### **Backend Metrics**
- `tpp_backend_up` - Backend status
- `tpp_backend_uptime_seconds` - Uptime
- `tpp_backend_requests_total` - HTTP requests
- `tpp_backend_email_sent_total` - Email count

### **Automation Metrics**
- `automation_system_uptime_seconds` - Orchestrator uptime
- `automation_workflows_count` - Active workflows
- `automation_workflow_failures_total` - Failed workflows

---

## 🔍 **VERIFYING SETUP**

### **Test Metrics in Explore**
1. Click **🔍 Explore** (magnifying glass icon)
2. Select **Prometheus** data source
3. Try these queries:
   ```
   up
   node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes * 100
   tpp_backend_uptime_seconds
   automation_system_uptime_seconds
   ```

### **Check Data Source Health**
1. **⚙️ Configuration** → **Data Sources**
2. Click **Prometheus**
3. **Test Connection** should show ✅ green

---

## 🚨 **ALERTING SETUP**

### **Create Simple Alert**
1. In any dashboard panel, click **⋮** → **Create Alert**
2. Set condition: `tpp_backend_up == 0` for 1 minute
3. Configure notifications (Discord/Email)
4. Save alert rule

### **Alert Notification Channels**
1. **⚙️ Configuration** → **Alerting** → **Notification channels**
2. Add **Discord** webhook: `https://discord.com/api/webhooks/YOUR_WEBHOOK`
3. Add **Email** with your SMTP settings

---

## 🛠️ **TROUBLESHOOTING**

### **Data Source Issues**
- **Problem**: "Data source not found"
- **Solution**: Check Prometheus is running: `curl http://31.97.222.218:9090/api/v1/targets`

### **No Data Showing**
- **Problem**: Dashboards show "No data"
- **Solution**: Check metrics endpoint: `curl http://31.97.222.218:4322/metrics`

### **Dashboard Loading Issues**
- **Problem**: JSON import failed
- **Solution**: Use Option A (import by ID) instead of manual JSON

---

## 🎯 **SUCCESS INDICATORS**

✅ You should see:
- Green data source test in Grafana  
- Metrics data in Explore queries
- Dashboard panels with graphs
- System health status indicators

---

## 📞 **HELPFUL COMMANDS**

```bash
# Check Prometheus targets
ssh tpp-vps "curl http://localhost:9090/api/v1/targets"

# Check metrics availability
ssh tpp-vps "curl http://localhost:4322/metrics | head -10"

# Restart Grafana if needed
ssh tpp-vps "cd ~/projects/tpp/.automation/monitoring && docker-compose restart grafana"
```

Your monitoring platform is now fully operational! 🎉
