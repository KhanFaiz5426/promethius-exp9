# Server Monitoring System using Prometheus and Grafana

A complete Docker-based server and application monitoring system demonstrating real-time metric collection, monitoring, alerting, and dashboard visualization.

## 📋 Project Introduction

This project implements a production-ready monitoring stack using:
- **Prometheus** for metrics collection and storage
- **Node Exporter** for system-level metrics (CPU, memory, disk, network)
- **Grafana** for beautiful, customizable dashboards
- **Node.js + Express** sample application with custom metrics via `prom-client`

The system is designed for educational purposes and can serve as a foundation for production monitoring.

---

## 🏗️ Architecture and Workflow

```
┌─────────────────┐     ┌──────────────┐     ┌─────────────┐
│  Node.js App    │     │  Prometheus  │     │   Grafana   │
│  (Port 3000)    │────▶│  (Port 9090) │────▶│  (Port 3001)│
│                 │     │              │     │             │
│ /metrics        │     │ Scrapes      │     │ Dashboards  │
│ /health         │     │ every 5s     │     │ Auto-load   │
└─────────────────┘     └──────────────┘     └─────────────┘
         │                      ▲
         │                      │
         ▼                      │
┌─────────────────┐             │
│  Node Exporter  │─────────────┘
│  (Port 9100)    │
│                 │
│ System metrics  │
└─────────────────┘
```

**Data Flow:**
1. **Node.js App** exposes metrics at `/metrics` using `prom-client`
2. **Node Exporter** exposes system metrics at `/metrics`
3. **Prometheus** scrapes both targets every 5 seconds
4. **Prometheus** evaluates alert rules
5. **Grafana** queries Prometheus and visualizes metrics in dashboards
6. **Dashboards** are auto-provisioned on Grafana startup

---

## 🛠️ Tools Used

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 24+ | Containerization |
| Docker Compose | v2+ | Multi-container orchestration |
| Node.js | 20 LTS | Application runtime |
| Express.js | 4.18+ | Web framework |
| prom-client | 15.1+ | Prometheus metrics client |
| Prometheus | 2.47+ | Metrics collection & storage |
| Node Exporter | 1.6+ | System metrics exporter |
| Grafana | 10.1+ | Visualization & dashboards |

---

## 📁 Project Folder Structure

```
server-monitoring/
│
├── app/
│   ├── server.js          # Express application with metrics
│   └── package.json       # Node.js dependencies
│
├── prometheus/
│   ├── prometheus.yml     # Prometheus scrape configuration
│   └── alert.rules.yml    # Alerting rules
│
├── grafana/
│   └── provisioning/
│       ├── datasources/
│       │   └── datasource.yml    # Prometheus datasource config
│       └── dashboards/
│           ├── dashboard.yml     # Dashboard provisioning config
│           └── server-monitoring-dashboard.json  # Pre-built dashboard
│
├── Dockerfile             # Multi-stage Node.js app build
├── docker-compose.yml     # Service orchestration
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

---

## 📦 Installation Requirements

### Prerequisites
- **Docker Desktop** (Windows/Mac) or **Docker Engine + Compose** (Linux)
- **Git** (for cloning)
- Minimum 4GB RAM available for containers
- Ports 3000, 3001, 9090, 9100 available

### Verify Installation
```bash
docker --version
docker compose version
```

---

## 🚀 Step-by-Step Execution Commands

### 1. Clone/Navigate to Project
```bash
cd server-monitoring
```

### 2. Build and Start All Services
```bash
# Build images and start containers in background
docker compose up -d --build
```

### 3. Verify All Containers Are Running
```bash
docker compose ps
```

Expected output:
```
NAME                           STATUS
server-monitoring-app          Up (healthy)
server-monitoring-prometheus   Up (healthy)
server-monitoring-node-exporter Up (healthy)
server-monitoring-grafana      Up (healthy)
```

### 4. View Logs (Optional)
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f prometheus
docker compose logs -f grafana
```

### 5. Stop Services
```bash
# Stop and remove containers (keeps volumes)
docker compose down

# Stop and remove everything including volumes
docker compose down -v
```

---

## 🌐 URLs to Access Each Service

| Service | URL | Credentials |
|---------|-----|-------------|
| **Node.js App** | http://localhost:3000 | - |
| **Health Check** | http://localhost:3000/health | - |
| **App Metrics** | http://localhost:3000/metrics | - |
| **Prometheus** | http://localhost:9090 | - |
| **Prometheus Targets** | http://localhost:9090/targets | - |
| **Prometheus Alerts** | http://localhost:9090/alerts | - |
| **Node Exporter** | http://localhost:9100/metrics | - |
| **Grafana** | http://localhost:3001 | admin / admin |

---

## 📊 How to Verify Metrics

### 1. Check Node.js Application Metrics
```bash
# Via browser
open http://localhost:3000/metrics

# Via curl
curl http://localhost:3000/metrics
```

Key metrics to look for:
- `nodejs_*` - Default Node.js metrics (CPU, memory, event loop)
- `http_requests_total` - Custom HTTP request counter
- `http_request_duration_seconds` - Request latency histogram
- `app_health_status` - Health gauge (1 = healthy)

### 2. Check Node Exporter Metrics
```bash
curl http://localhost:9100/metrics
```

Key metrics:
- `node_cpu_seconds_total` - CPU time by mode
- `node_memory_MemTotal_bytes` - Total memory
- `node_memory_MemAvailable_bytes` - Available memory
- `node_filesystem_*` - Disk usage
- `node_network_*` - Network I/O

### 3. Verify Prometheus Scraping
1. Open http://localhost:9090/targets
2. Verify all 3 targets show **UP**:
   - `prometheus` (localhost:9090)
   - `nodejs-app` (app:3000)
   - `node-exporter` (node-exporter:9100)

### 4. Query Prometheus Directly
```bash
# CPU usage
curl "http://localhost:9090/api/v1/query?query=100%20-%20(avg%20by%20(instance)%20(irate(node_cpu_seconds_total{mode%3D%22idle%22}[5m]))%20*%20100)"

# App up status
curl "http://localhost:9090/api/v1/query?query=up{job%3D%22nodejs-app%22}"
```

---

## 📈 How to View Grafana Dashboards

### 1. Access Grafana
- URL: http://localhost:3001
- Username: `admin`
- Password: `admin`

### 2. Dashboard Auto-Loading
The dashboard is **automatically provisioned** on first startup. You'll see:
- **Folder**: "Server Monitoring"
- **Dashboard**: "Server Monitoring Dashboard"

### 3. Dashboard Panels

| Panel | Description | Metrics |
|-------|-------------|---------|
| **CPU Usage (%)** | Time series of CPU utilization | `node_cpu_seconds_total` |
| **Memory Usage (%)** | Memory utilization over time | `node_memory_MemAvailable_bytes` / `MemTotal` |
| **HTTP Request Rate** | Requests per second by method/route | `http_requests_total` |
| **Application Status** | UP/DOWN status indicator | `up{job="nodejs-app"}` |
| **Health Check Status** | Custom health gauge | `app_health_status` |
| **P95 Request Latency** | 95th percentile latency | `http_request_duration_seconds` |
| **HTTP Error Rate (5xx)** | 5xx error percentage | `http_requests_total` with 5xx status |
| **Memory Usage Details** | Used vs Available memory | `node_memory_*` |
| **CPU Usage by Mode** | CPU time breakdown | `node_cpu_seconds_total` by mode |
| **Node Exporter Status** | Exporter UP/DOWN | `up{job="node-exporter"}` |
| **Prometheus Status** | Prometheus UP/DOWN | `up{job="prometheus"}` |

### 4. Customize Time Range
- Top-right corner: Select "Last 1 hour", "Last 6 hours", "Last 24 hours", or custom

### 5. Explore Metrics
- Click any panel title → "Explore" to query raw metrics
- Use PromQL in the Explore tab

---

## ⚠️ Alert Rules Configured

| Alert | Condition | Severity |
|-------|-----------|----------|
| **HighCPUUsage** | CPU > 80% for 1m | Warning |
| **HighMemoryUsage** | Memory > 85% for 2m | Warning |
| **ApplicationDown** | App `up` == 0 for 30s | Critical |
| **ApplicationUnhealthy** | Health gauge == 0 for 30s | Critical |
| **HighRequestLatency** | P95 > 1s for 2m | Warning |
| **HighErrorRate** | 5xx rate > 5% for 1m | Warning |
| **NodeExporterDown** | Exporter `up` == 0 for 30s | Critical |

View alerts at: http://localhost:9090/alerts

---

## 🔧 Troubleshooting

### Common Issues and Solutions

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Linux/Mac

# Kill process or change ports in docker-compose.yml
```

#### 2. Containers Not Starting
```bash
# Check logs for errors
docker compose logs app
docker compose logs prometheus
docker compose logs grafana

# Rebuild from scratch
docker compose down -v
docker compose up -d --build
```

#### 3. Prometheus Targets Show DOWN
- Ensure containers are on same network (`monitoring-network`)
- Check service names in `prometheus.yml` match docker-compose service names
- Verify firewall isn't blocking inter-container communication

#### 4. Grafana Dashboard Not Loading
```bash
# Check provisioning logs
docker compose logs grafana | grep -i provision

# Verify dashboard JSON is valid
cat grafana/provisioning/dashboards/server-monitoring-dashboard.json | jq .
```

#### 5. Node Exporter Shows Linux VM Metrics (Windows)
**Important**: On Windows with Docker Desktop, Node Exporter runs inside a Linux VM. It reports metrics for the **Linux VM/container**, not the Windows host. This is expected behavior.

To monitor Windows host metrics, you would need:
- Run Node Exporter directly on Windows (not in Docker)
- Or use WSL2 integration with host networking

#### 6. Permission Issues (Linux)
```bash
# Fix volume permissions
sudo chown -R 472:472 grafana-data/
sudo chown -R 65534:65534 prometheus-data/
```

#### 7. Out of Memory
```bash
# Increase Docker Desktop memory limit
# Settings → Resources → Advanced → Memory: 4GB+
```

---

## 🧪 Testing the Setup

### Generate Load to See Metrics
```bash
# Install hey (load testing tool) or use curl in a loop

# Simple load test
for i in {1..100}; do curl -s http://localhost:3000/ > /dev/null; done

# Health checks
for i in {1..50}; do curl -s http://localhost:3000/health > /dev/null; done

# Error generation (if you add error routes)
```

### Verify Alert Firing
1. Stop the app: `docker compose stop app`
2. Check Prometheus alerts page: http://localhost:9090/alerts
3. Should see `ApplicationDown` firing after 30 seconds
4. Restart: `docker compose start app`

---

## 📝 Conclusion

This project provides a complete, working monitoring stack that demonstrates:

✅ **Real-time metric collection** from application and infrastructure  
✅ **Multi-target scraping** with 5-second intervals  
✅ **Custom application metrics** (counters, histograms, gauges)  
✅ **System-level metrics** via Node Exporter  
✅ **Alert rules** for critical and warning conditions  
✅ **Auto-provisioned Grafana dashboards** with 11 panels  
✅ **Docker Compose orchestration** with health checks and persistent volumes  
✅ **Production-ready patterns** (non-root user, multi-stage builds, proper networking)

### Next Steps for Production
- Add Alertmanager for alert notifications (email, Slack, PagerDuty)
- Enable TLS/SSL for all services
- Add authentication/authorization
- Implement log aggregation (Loki, ELK)
- Add distributed tracing (Tempo, Jaeger)
- Configure backup for Prometheus/Grafana data
- Set up high availability for Prometheus

---

## 📄 License

MIT License - Feel free to use for learning and projects.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Happy Monitoring! 🚀**