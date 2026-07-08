#!/bin/bash
set -e

NAMESPACE="procureai"

echo "=== ProcureAI Kubernetes Deployment ==="

# Create namespace first
echo "[1/6] Creating namespace..."
kubectl apply -f k8s/namespaces/namespace.yaml

# Apply secrets and configmaps
echo "[2/6] Applying secrets and configmaps..."
kubectl apply -f k8s/secrets/secrets.yaml
kubectl apply -f k8s/configmaps/config.yaml

# Deploy infrastructure
echo "[3/6] Deploying infrastructure (postgres, rabbitmq, redis, minio)..."
kubectl apply -f k8s/deployments/postgres.yaml
kubectl apply -f k8s/deployments/rabbitmq.yaml
kubectl apply -f k8s/deployments/redis.yaml
kubectl apply -f k8s/deployments/minio.yaml
kubectl apply -f k8s/services/infrastructure.yaml

echo "Waiting for infrastructure to be ready..."
kubectl wait --for=condition=available deployment/procureai-postgres -n $NAMESPACE --timeout=120s
kubectl wait --for=condition=available deployment/procureai-rabbitmq -n $NAMESPACE --timeout=120s
kubectl wait --for=condition=available deployment/procureai-redis -n $NAMESPACE --timeout=60s

# Deploy Java services
echo "[4/6] Deploying Java services..."
kubectl apply -f k8s/deployments/auth-service.yaml
kubectl apply -f k8s/deployments/api-gateway.yaml
kubectl apply -f k8s/deployments/user-service.yaml
kubectl apply -f k8s/deployments/procurement-service.yaml
kubectl apply -f k8s/deployments/rfq-service.yaml
kubectl apply -f k8s/deployments/quotation-service.yaml
kubectl apply -f k8s/deployments/supplier-service.yaml
kubectl apply -f k8s/deployments/invoice-service.yaml
kubectl apply -f k8s/deployments/notification-service.yaml
kubectl apply -f k8s/deployments/ocr-service.yaml
kubectl apply -f k8s/deployments/ai-service.yaml
kubectl apply -f k8s/deployments/frontend.yaml

# Deploy services
echo "[5/6] Creating services..."
kubectl apply -f k8s/services/java-services.yaml

# Deploy ingress, HPA, PDB
echo "[6/6] Deploying ingress, autoscaling, and disruption budgets..."
kubectl apply -f k8s/ingress/nginx-ingress.yaml
kubectl apply -f k8s/hpa/horizontal-pod-autoscalers.yaml
kubectl apply -f k8s/pdb/pod-disruption-budgets.yaml

echo ""
echo "=== Deployment Complete ==="
echo ""
echo "Infrastructure:"
echo "  Postgres:    localhost:5432 (or procureai-postgres:5432 in-cluster)"
echo "  RabbitMQ:    localhost:15672 (management UI)"
echo "  Redis:       localhost:6379"
echo "  MinIO:       localhost:9001 (console)"
echo ""
echo "Services:"
echo "  Auth:        localhost:8081"
echo "  Gateway:     localhost:8082"
echo "  User:        localhost:8090"
echo "  RFQ:         localhost:8083"
echo "  Quotation:   localhost:8084"
echo "  Supplier:    localhost:8085"
echo "  Invoice:     localhost:8086"
echo "  Notification:localhost:8087"
echo "  Procurement: localhost:8088"
echo "  OCR:         localhost:8091"
echo "  AI:          localhost:8000"
echo "  Frontend:    localhost:3000"
echo ""
echo "Ingress (requires nginx-ingress-controller):"
echo "  api.procureai.com/api/**  -> api-gateway"
echo "  <tenant>.procureai.com    -> frontend + api-gateway"
echo ""
echo "Check status: kubectl get pods -n procureai"
