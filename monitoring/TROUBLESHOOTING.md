# Troubleshooting Guide

## Common Issues and Solutions

### 1. App Won't Shut Down Cleanly (ECONNREFUSED Errors)

**Symptoms:**
- `ECONNREFUSED` errors when trying to stop the app
- Unhandled rejections preventing clean shutdown
- App hangs when pressing Ctrl+C

**Solutions:**

**Option A: Use the no-telemetry development mode**
```bash
npm run dev:no-telemetry
```

**Option B: Disable telemetry temporarily**
```bash
DISABLE_TELEMETRY=true npm run dev
```

**Option C: Force kill the process**
```bash
# On Windows
taskkill /F /IM node.exe

# On Mac/Linux
pkill -f "tsx server.ts"
```

### 2. Port Already in Use

**Symptoms:**
- `EADDRINUSE` error when starting the app
- Port 3002 or 9464 already occupied

**Solutions:**
```bash
# Check what's using the port
netstat -ano | findstr :3002
netstat -ano | findstr :9464

# Kill the process using the port
taskkill /PID <PID> /F
```

### 3. Prometheus Target Down

**Symptoms:**
- Prometheus shows target as "DOWN"
- Connection refused errors

**Solutions:**
1. Make sure your Next.js app is running
2. Check if metrics endpoint is accessible: `curl http://localhost:9464/metrics`
3. Restart the monitoring stack: `docker-compose restart`

### 4. Grafana Dashboard Not Loading

**Symptoms:**
- Dashboard shows "No data"
- Dashboard import fails

**Solutions:**
1. Check if Prometheus has data: http://localhost:9090/graph
2. Verify the datasource is configured correctly
3. Restart Grafana: `docker-compose restart grafana`

### 5. High Memory Usage

**Symptoms:**
- App uses too much memory
- System becomes slow

**Solutions:**
1. Disable telemetry for development: `npm run dev:no-telemetry`
2. Reduce Prometheus retention in `prometheus.yml`
3. Restart the monitoring stack periodically

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DISABLE_TELEMETRY` | Disable telemetry completely | `false` |
| `PORT` | Next.js app port | `3002` |
| `PROMETHEUS_PORT` | Metrics endpoint port | `9464` |

## Quick Commands

```bash
# Start without telemetry (recommended for development)
npm run dev:no-telemetry

# Start with telemetry
npm run dev

# Check if metrics are working
curl http://localhost:9464/metrics

# Check Prometheus targets
curl http://localhost:9090/api/v1/targets

# Restart monitoring stack
cd monitoring && docker-compose restart

# View logs
docker-compose logs -f
```

## Performance Tips

1. **For Development**: Use `npm run dev:no-telemetry` to avoid overhead
2. **For Production**: Use `npm run start` with telemetry enabled
3. **Memory Issues**: Restart the monitoring stack daily
4. **Network Issues**: Check Docker network settings

## Getting Help

If you're still experiencing issues:

1. Check the logs: `docker-compose logs -f`
2. Verify all services are running: `docker-compose ps`
3. Test connectivity: `curl http://localhost:9464/metrics`
4. Restart everything: `docker-compose down && docker-compose up -d` 