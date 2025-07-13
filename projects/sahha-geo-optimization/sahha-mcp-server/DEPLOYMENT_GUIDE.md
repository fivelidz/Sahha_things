# Sahha MCP Server Deployment Guide 🚀

Comprehensive guide for deploying the Sahha MCP Server in production environments with multiple hosting options and enterprise-grade configurations.

## 🎯 Deployment Overview

The Sahha MCP Server can be deployed on various platforms, each optimized for different use cases:

- **Vercel**: Serverless, auto-scaling, global CDN
- **Railway**: Container-based, simple deployment
- **Docker**: Self-hosted, full control
- **Kubernetes**: Enterprise-scale, container orchestration
- **AWS/GCP/Azure**: Cloud provider native services

## 🏗️ Architecture Decisions

### Serverless vs Container-based

| Factor | Serverless (Vercel) | Containers (Docker) |
|--------|-------------------|-------------------|
| **Scaling** | Automatic, instant | Manual/Auto-scaling |
| **Cost** | Pay-per-request | Fixed hosting costs |
| **Cold Starts** | ~100-500ms | Always warm |
| **Customization** | Limited | Full control |
| **Maintenance** | Minimal | Manual updates |

### Recommended Deployments

- **Development**: Local Docker Compose
- **Small Scale**: Vercel or Railway
- **Enterprise**: Kubernetes or cloud-native
- **High Traffic**: Load-balanced Docker containers

## 🚀 Vercel Deployment (Recommended)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/fivelidz/Sahha_things)

### Manual Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy from project root
cd sahha-mcp-server
vercel

# Configure environment variables
vercel env add SAHHA_API_URL production
vercel env add SAHHA_AUTH_TOKEN production
vercel env add JWT_SECRET production

# Deploy to production
vercel --prod
```

### Environment Variables Setup

```bash
# Add all required environment variables
vercel env add NODE_ENV production
vercel env add SAHHA_API_URL production
vercel env add SAHHA_CLIENT_ID production
vercel env add SAHHA_CLIENT_SECRET production
vercel env add SAHHA_AUTH_TOKEN production
vercel env add JWT_SECRET production
vercel env add ALLOWED_ORIGINS production
vercel env add RATE_LIMIT_MAX_REQUESTS production
```

### Custom Domain Setup

```bash
# Add custom domain
vercel domains add sahha-mcp.yourdomain.com

# Update CORS settings
vercel env add ALLOWED_ORIGINS "https://sahha-mcp.yourdomain.com,https://yourdomain.com"
```

### Vercel Configuration

```json
{
  "version": 2,
  "name": "sahha-mcp-server",
  "regions": ["iad1", "sfo1", "lhr1"],
  "functions": {
    "src/server.js": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

## 🚂 Railway Deployment

### One-Click Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/sahha-mcp)

### Manual Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Initialize project
railway init

# Deploy
railway up

# Add environment variables
railway variables set SAHHA_API_URL=https://sandbox.sahha.health/api
railway variables set SAHHA_AUTH_TOKEN=your_token_here
railway variables set JWT_SECRET=your_secret_here

# Custom domain
railway domain create sahha-mcp.yourdomain.com
```

### Railway Configuration

```toml
# railway.toml
[build]
builder = "nixpacks"

[deploy]
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "always"

[[services]]
name = "sahha-mcp-server"
source = "."

[services.variables]
NODE_ENV = "production"
PORT = { default = "3000" }
```

## 🐳 Docker Deployment

### Simple Docker Run

```bash
# Build image
docker build -t sahha-mcp-server .

# Run container
docker run -d \
  --name sahha-mcp \
  -p 3000:3000 \
  -e SAHHA_API_URL=https://sandbox.sahha.health/api \
  -e SAHHA_AUTH_TOKEN=your_token \
  -e JWT_SECRET=your_secret \
  --restart unless-stopped \
  sahha-mcp-server
```

### Docker Compose (Recommended)

```yaml
# docker-compose.prod.yml
version: '3.8'

services:
  sahha-mcp-server:
    build: .
    container_name: sahha-mcp-server
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - SAHHA_API_URL=${SAHHA_API_URL}
      - SAHHA_AUTH_TOKEN=${SAHHA_AUTH_TOKEN}
      - JWT_SECRET=${JWT_SECRET}
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./logs:/app/logs
      - ./cache:/app/cache
    depends_on:
      - redis
      - nginx
    networks:
      - sahha-network

  redis:
    image: redis:7-alpine
    container_name: sahha-redis
    restart: unless-stopped
    volumes:
      - redis-data:/data
    networks:
      - sahha-network

  nginx:
    image: nginx:alpine
    container_name: sahha-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - sahha-mcp-server
    networks:
      - sahha-network

volumes:
  redis-data:

networks:
  sahha-network:
    driver: bridge
```

### Production Docker Commands

```bash
# Production deployment
docker-compose -f docker-compose.prod.yml up -d

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# Update deployment
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d

# Backup data
docker run --rm -v sahha-mcp-server_redis-data:/data -v $(pwd):/backup alpine tar czf /backup/redis-backup.tar.gz -C /data .
```

## ☸️ Kubernetes Deployment

### Kubernetes Manifests

```yaml
# namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: sahha-mcp
---
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: sahha-mcp-server
  namespace: sahha-mcp
spec:
  replicas: 3
  selector:
    matchLabels:
      app: sahha-mcp-server
  template:
    metadata:
      labels:
        app: sahha-mcp-server
    spec:
      containers:
      - name: sahha-mcp-server
        image: sahha-mcp-server:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: SAHHA_API_URL
          valueFrom:
            secretKeyRef:
              name: sahha-secrets
              key: api-url
        - name: SAHHA_AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: sahha-secrets
              key: auth-token
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: sahha-secrets
              key: jwt-secret
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
# service.yaml
apiVersion: v1
kind: Service
metadata:
  name: sahha-mcp-service
  namespace: sahha-mcp
spec:
  selector:
    app: sahha-mcp-server
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: ClusterIP
---
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: sahha-mcp-ingress
  namespace: sahha-mcp
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - sahha-mcp.yourdomain.com
    secretName: sahha-mcp-tls
  rules:
  - host: sahha-mcp.yourdomain.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: sahha-mcp-service
            port:
              number: 80
```

### Kubernetes Secrets

```bash
# Create secrets
kubectl create secret generic sahha-secrets \
  --from-literal=api-url=https://sandbox.sahha.health/api \
  --from-literal=auth-token=your_sahha_token \
  --from-literal=jwt-secret=your_jwt_secret \
  -n sahha-mcp
```

### Helm Chart (Advanced)

```yaml
# values.yaml
replicaCount: 3

image:
  repository: sahha-mcp-server
  tag: latest
  pullPolicy: IfNotPresent

service:
  type: ClusterIP
  port: 80

ingress:
  enabled: true
  hostname: sahha-mcp.yourdomain.com
  tls: true

resources:
  limits:
    cpu: 500m
    memory: 512Mi
  requests:
    cpu: 250m
    memory: 256Mi

autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 10
  targetCPUUtilizationPercentage: 80

redis:
  enabled: true
  auth:
    enabled: false
```

## ☁️ Cloud Provider Deployments

### AWS ECS Deployment

```json
{
  "family": "sahha-mcp-server",
  "taskRoleArn": "arn:aws:iam::123456789012:role/ecsTaskRole",
  "executionRoleArn": "arn:aws:iam::123456789012:role/ecsTaskExecutionRole",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "sahha-mcp-server",
      "image": "your-account.dkr.ecr.region.amazonaws.com/sahha-mcp-server:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "SAHHA_AUTH_TOKEN",
          "valueFrom": "arn:aws:secretsmanager:region:123456789012:secret:sahha-secrets"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/sahha-mcp-server",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Run

```yaml
# service.yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: sahha-mcp-server
  annotations:
    run.googleapis.com/ingress: all
spec:
  template:
    metadata:
      annotations:
        autoscaling.knative.dev/maxScale: "100"
        run.googleapis.com/cpu-throttling: "false"
    spec:
      containerConcurrency: 80
      containers:
      - image: gcr.io/your-project/sahha-mcp-server
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: production
        - name: SAHHA_AUTH_TOKEN
          valueFrom:
            secretKeyRef:
              name: sahha-secrets
              key: auth-token
        resources:
          limits:
            cpu: 1
            memory: 512Mi
```

### Azure Container Instances

```bash
# Deploy to Azure Container Instances
az container create \
  --resource-group sahha-mcp-rg \
  --name sahha-mcp-server \
  --image sahha-mcp-server:latest \
  --dns-name-label sahha-mcp \
  --ports 3000 \
  --environment-variables \
    NODE_ENV=production \
  --secure-environment-variables \
    SAHHA_AUTH_TOKEN=$SAHHA_AUTH_TOKEN \
    JWT_SECRET=$JWT_SECRET \
  --cpu 1 \
  --memory 1
```

## 🔧 Production Configuration

### Environment Variables (Production)

```bash
# Core Configuration
NODE_ENV=production
PORT=3000

# Sahha API
SAHHA_API_URL=https://api.sahha.health/api
SAHHA_CLIENT_ID=prod_client_id
SAHHA_CLIENT_SECRET=prod_client_secret
SAHHA_AUTH_TOKEN=prod_auth_token

# Security
JWT_SECRET=super_secure_random_string_at_least_32_characters
API_KEY_REQUIRED=true
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# Performance
CACHE_TTL_DEFAULT=3600
CACHE_TTL_PATTERNS=7200
RATE_LIMIT_MAX_REQUESTS=1000
RATE_LIMIT_WINDOW_MS=900000

# Monitoring
ENABLE_AUDIT_LOGGING=true
AUDIT_LOG_RETENTION_DAYS=90
ENABLE_PERFORMANCE_MONITORING=true

# External Services
REDIS_URL=redis://prod-redis-server:6379
DATABASE_URL=postgresql://user:pass@db-server:5432/sahha_mcp
```

### SSL/TLS Configuration

#### Nginx SSL Configuration

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream sahha_mcp_servers {
        least_conn;
        server sahha-mcp-server:3000 max_fails=3 fail_timeout=30s;
        server sahha-mcp-server-2:3000 max_fails=3 fail_timeout=30s;
        server sahha-mcp-server-3:3000 max_fails=3 fail_timeout=30s;
    }

    server {
        listen 80;
        server_name sahha-mcp.yourdomain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name sahha-mcp.yourdomain.com;

        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        location / {
            proxy_pass http://sahha_mcp_servers;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            
            # Health check
            proxy_connect_timeout 5s;
            proxy_send_timeout 60s;
            proxy_read_timeout 60s;
        }

        location /health {
            proxy_pass http://sahha_mcp_servers/health;
            access_log off;
        }
    }
}
```

### Monitoring & Logging

#### Prometheus Configuration

```yaml
# prometheus.yml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'sahha-mcp-server'
    static_configs:
      - targets: ['sahha-mcp-server:3000']
    metrics_path: '/metrics'
    scrape_interval: 30s

  - job_name: 'redis'
    static_configs:
      - targets: ['redis:6379']

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093
```

#### Grafana Dashboards

```json
{
  "dashboard": {
    "id": null,
    "title": "Sahha MCP Server",
    "panels": [
      {
        "title": "Request Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(http_requests_total[5m])",
            "legendFormat": "{{method}} {{status}}"
          }
        ]
      },
      {
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))",
            "legendFormat": "95th percentile"
          }
        ]
      },
      {
        "title": "Cache Hit Rate",
        "type": "stat",
        "targets": [
          {
            "expr": "cache_hit_rate",
            "legendFormat": "Hit Rate %"
          }
        ]
      }
    ]
  }
}
```

## 🔍 Health Checks & Monitoring

### Health Check Endpoints

```bash
# Basic health check
curl https://sahha-mcp.yourdomain.com/health

# Detailed health status
curl https://sahha-mcp.yourdomain.com/health/detailed

# Cache statistics
curl https://sahha-mcp.yourdomain.com/mcp/cache/stats

# Security audit
curl https://sahha-mcp.yourdomain.com/mcp/security/stats
```

### Uptime Monitoring

```bash
# Pingdom-style monitoring
*/5 * * * * curl -f https://sahha-mcp.yourdomain.com/health || echo "Server down at $(date)" >> /var/log/sahha-mcp-alerts.log
```

### Log Aggregation

#### ELK Stack Configuration

```yaml
# docker-compose.logging.yml
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.8.0
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms512m -Xmx512m"
    volumes:
      - es-data:/usr/share/elasticsearch/data

  logstash:
    image: docker.elastic.co/logstash/logstash:8.8.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch

  kibana:
    image: docker.elastic.co/kibana/kibana:8.8.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch

volumes:
  es-data:
```

## 🚨 Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Backup Redis data
docker exec sahha-redis redis-cli BGSAVE
docker cp sahha-redis:/data/dump.rdb ./backups/redis-$(date +%Y%m%d).rdb

# Backup logs
tar -czf ./backups/logs-$(date +%Y%m%d).tar.gz ./logs/

# Upload to S3
aws s3 cp ./backups/ s3://sahha-mcp-backups/ --recursive
```

### Recovery Procedure

```bash
#!/bin/bash
# restore.sh

# Download latest backup
aws s3 cp s3://sahha-mcp-backups/ ./restore/ --recursive

# Restore Redis data
docker cp ./restore/redis-latest.rdb sahha-redis:/data/dump.rdb
docker restart sahha-redis

# Restore logs
tar -xzf ./restore/logs-latest.tar.gz
```

## 📊 Performance Optimization

### Load Testing

```bash
# Install k6
curl https://github.com/grafana/k6/releases/download/v0.45.0/k6-v0.45.0-linux-amd64.tar.gz -L | tar xvz --strip-components 1

# Load test script
cat << 'EOF' > load-test.js
import http from 'k6/http';
import { check } from 'k6';

export let options = {
  stages: [
    { duration: '2m', target: 100 },
    { duration: '5m', target: 200 },
    { duration: '2m', target: 0 },
  ],
};

export default function() {
  let response = http.get('https://sahha-mcp.yourdomain.com/health');
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
EOF

# Run load test
./k6 run load-test.js
```

### Auto-scaling Configuration

#### Kubernetes HPA

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: sahha-mcp-hpa
  namespace: sahha-mcp
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: sahha-mcp-server
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## 🔒 Security Hardening

### Production Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] JWT secrets are randomly generated and secure
- [ ] API keys are properly configured
- [ ] Rate limiting is enabled
- [ ] Input validation is comprehensive
- [ ] Audit logging is enabled
- [ ] CORS is properly configured
- [ ] Security headers are set
- [ ] Container runs as non-root user
- [ ] Secrets are stored securely (not in environment variables)

### Security Headers

```javascript
// Additional security headers
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});
```

## 🚀 Production Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] SSL certificates installed
- [ ] Database/Redis configured
- [ ] Monitoring setup
- [ ] Backup strategy implemented
- [ ] Load testing completed
- [ ] Security audit passed

### Post-deployment

- [ ] Health checks passing
- [ ] Logs are flowing
- [ ] Metrics are collected
- [ ] Alerts are configured
- [ ] Performance baselines established
- [ ] Team access configured

## 📞 Support & Troubleshooting

### Common Issues

1. **Slow Response Times**
   - Check cache hit rates
   - Monitor database performance
   - Verify GEO pattern optimization

2. **Authentication Failures**
   - Verify Sahha API credentials
   - Check JWT secret configuration
   - Review security logs

3. **High Memory Usage**
   - Check cache size limits
   - Monitor for memory leaks
   - Review container resource limits

### Getting Help

- **Documentation**: [Full deployment docs](./docs/)
- **Issues**: [GitHub Issues](https://github.com/fivelidz/Sahha_things/issues)
- **Community**: [Discord Support](https://discord.gg/sahha-mcp)
- **Enterprise**: enterprise@sahha-mcp.dev

---

**Your Sahha MCP Server is now ready for production! 🎉**

*This deployment guide ensures your server runs reliably, securely, and efficiently in any production environment.*