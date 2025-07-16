#!/bin/bash

# PB Website Monitoring Setup Script
# This script sets up the complete monitoring stack for the PB Website

set -e

echo "🚀 Setting up PB Website Monitoring Stack..."
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Navigate to monitoring directory
cd "$(dirname "$0")"

print_status "Starting Prometheus and Grafana containers..."

# Pull latest images
print_status "Pulling latest Docker images..."
docker-compose pull

# Start the services
print_status "Starting monitoring services..."
docker-compose up -d

# Wait for services to start
print_status "Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    print_status "✅ Monitoring services are running!"
else
    print_error "❌ Failed to start monitoring services"
    print_error "Check logs with: docker-compose logs"
    exit 1
fi

# Display service URLs
echo ""
echo "🌐 Service URLs:"
echo "=================="
echo "• Prometheus: http://localhost:9090"
echo "• Grafana: http://localhost:3001 (admin/admin)"
echo "• Your App: http://localhost:3002"
echo "• Metrics: http://localhost:9464/metrics"
echo ""

# Wait for Prometheus to be ready
print_status "Waiting for Prometheus to be ready..."
until curl -s http://localhost:9090/api/v1/targets > /dev/null 2>&1; do
    sleep 2
done

# Wait for Grafana to be ready
print_status "Waiting for Grafana to be ready..."
until curl -s http://localhost:3001/api/health > /dev/null 2>&1; do
    sleep 2
done

print_status "✅ All services are ready!"

# Check if the Next.js app is running
if curl -s http://localhost:9464/metrics > /dev/null 2>&1; then
    print_status "✅ Next.js app metrics are available"
else
    print_warning "⚠️  Next.js app is not running yet"
    print_warning "Start it with: npm run dev"
fi

echo ""
echo "🎯 Quick Start:"
echo "==============="
echo "1. Start your Next.js app: npm run dev"
echo "2. Open Grafana: http://localhost:3001"
echo "3. Login with admin/admin"
echo "4. View the PB Website dashboard"
echo ""

echo "🔧 Useful Commands:"
echo "=================="
echo "• View logs: docker-compose logs -f"
echo "• Stop services: docker-compose down"
echo "• Restart services: docker-compose restart"
echo "• View metrics: curl http://localhost:9464/metrics"
echo ""

print_status "Setup complete! 🎉" 