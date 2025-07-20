# PB Website Monitoring Setup Guide

This guide will help you set up comprehensive monitoring for your Next.js application using OpenTelemetry, Prometheus, and Grafana.

## 🏗️ Architecture Overview

```
Next.js App (with OpenTelemetry) → Prometheus (metrics collection) → Grafana (visualization)
```

- **OpenTelemetry SDK**: Collects metrics from your Next.js application
- **Prometheus**: Scrapes and stores metrics from the OpenTelemetry exporter
- **Grafana**: Visualizes metrics with dashboards and alerts

## 📋 Prerequisites

- Docker and Docker Compose installed
- Node.js and npm installed
- Your Next.js application running

## 🚀 Quick Start

### 1. Start the monitoring stack

```bash
# Navigate to monitoring directory
cd monitoring

# Start Prometheus and Grafana
docker-compose up -d

# Check if services are running
docker-compose ps
```

### 2. Start your Next.js application with monitoring

```bash
# From the root directory
npm run dev

# Or for production
npm run build
npm run start
```

### 3. Access the services

- **Your Next.js App**: http://localhost:3002
- **Prometheus**: http://localhost:9090
- **Grafana**: http://localhost:3001 (admin/admin)
- **Metrics Endpoint**: http://localhost:9464/metrics

## 📊 Grafana Dashboard Setup

### Initial Setup

1. Open Grafana at http://localhost:3001
2. Login with `admin` / `admin`
3. Change the default password when prompted
4. The dashboard should be automatically loaded from the provisioning

### Manual Dashboard Import (if needed)

If the dashboard doesn't load automatically:

1. Go to **+ → Import**
2. Upload the `monitoring/grafana/dashboards/pb-website-dashboard.json` file
3. Select the Prometheus datasource
4. Click **Import**

### Key Metrics Available

- **HTTP Requests Total**: Total number of requests per second
- **Response Time Percentiles**: 50th, 90th, 95th, and 99th percentiles
- **Error Rate**: Percentage of failed requests
- **Status Code Distribution**: Breakdown of HTTP status codes
- **Request Methods**: Distribution of GET, POST, PUT, DELETE requests
- **Top Routes**: Most requested endpoints
- **Active Connections**: Current requests in progress

## 🔧 Configuration

### Environment Variables

You can customize the monitoring setup using these environment variables:

```bash
# Prometheus metrics port
PROMETHEUS_PORT=9464

# Next.js app port
PORT=3002

# Grafana admin password
GF_SECURITY_ADMIN_PASSWORD=your-secure-password
```

### Prometheus Configuration

The Prometheus configuration is in `monitoring/prometheus.yml`. Key settings:

- **Scrape Interval**: 10 seconds (configurable)
- **Targets**: Your Next.js app at `host.docker.internal:9464`
- **Retention**: 200 hours of data

### Custom Metrics

OpenTelemetry automatically collects HTTP metrics, but you can add custom metrics using the OpenTelemetry API:

```typescript
import { metrics } from '@opentelemetry/api';

const meter = metrics.getMeter('my-app', '1.0.0');
const counter = meter.createCounter('my_custom_metric', {
  description: 'My custom metric',
});

// Record custom events
counter.add(1, { label: 'value' });
```

## 📈 Metrics Collection

OpenTelemetry automatically collects HTTP metrics from your Next.js application. No additional code is needed in your API routes - metrics are collected automatically for:

- HTTP request counts
- Response times
- Status codes
- Request methods
- Error rates

## 🎯 Advanced Queries

### Prometheus Queries

Here are some useful Prometheus queries you can use:

```promql
# Request rate by endpoint
sum(rate(http_server_duration_count[5m])) by (http_method)

# Error rate percentage
sum(rate(http_server_duration_count{http_status_code=~"4..|5.."}[5m])) / sum(rate(http_server_duration_count[5m])) * 100

# 95th percentile response time
histogram_quantile(0.95, rate(http_server_duration_bucket[5m]))

# Average response time
sum(rate(http_server_duration_sum[5m])) / sum(rate(http_server_duration_count[5m]))
```

### Grafana Alerts

You can set up alerts for:

- High error rates (> 5%)
- Slow response times (> 2 seconds)
- High request volumes
- Service unavailability

## 🛠️ Troubleshooting

### Common Issues

1. **Metrics not showing in Grafana**
   - Check if Prometheus is scraping: http://localhost:9090/targets
   - Verify metrics endpoint: http://localhost:9464/metrics
   - Check Docker network connectivity

2. **Dashboard not loading**
   - Restart Grafana: `docker-compose restart grafana`
   - Check logs: `docker-compose logs grafana`

3. **High memory usage**
   - Adjust Prometheus retention settings
   - Reduce scrape frequency
   - Limit metric labels

### Debug Commands

```bash
# Check if metrics are being generated
curl http://localhost:9464/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# View container logs
docker-compose logs -f prometheus
docker-compose logs -f grafana

# Check Docker network
docker network ls
docker network inspect monitoring_monitoring
```

## 🔒 Production Considerations

### Security

1. **Change Default Passwords**
   ```bash
   # Update docker-compose.yml
   GF_SECURITY_ADMIN_PASSWORD=your-secure-password
   ```

2. **Network Security**
   - Use internal networks for service communication
   - Expose only necessary ports
   - Use reverse proxy for external access

3. **Data Retention**
   - Configure appropriate retention policies
   - Set up data backup strategies
   - Monitor disk usage

### Performance

1. **Optimize Scrape Intervals**
   - Balance between data granularity and performance
   - Use different intervals for different metrics

2. **Resource Limits**
   ```yaml
   # In docker-compose.yml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 512M
   ```

### Scaling

1. **Multiple Instances**
   - Use service discovery for dynamic targets
   - Implement load balancing
   - Consider federation for multiple Prometheus instances

2. **Storage**
   - Use persistent volumes for production
   - Consider remote storage solutions
   - Implement backup strategies

## 🎉 Next Steps

1. **Custom Dashboards**: Create dashboards specific to your business metrics
2. **Alerting**: Set up alerts for critical metrics
3. **Log Integration**: Add log aggregation with ELK stack or similar
4. **Tracing**: Add distributed tracing with Jaeger or Zipkin
5. **APM**: Consider full APM solutions for deeper insights

## 📚 Additional Resources

- [OpenTelemetry Documentation](https://opentelemetry.io/docs/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Next.js Performance Monitoring](https://nextjs.org/docs/advanced-features/measuring-performance)

---

For support or questions, please check the project documentation or create an issue in the repository. 