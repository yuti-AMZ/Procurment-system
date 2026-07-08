@echo off
set NAMESPACE=procureai

echo === ProcureAI Kubernetes Deployment ===

echo [1/6] Creating namespace...
kubectl apply -f k8s\namespaces\namespace.yaml

echo [2/6] Applying secrets and configmaps...
kubectl apply -f k8s\secrets\secrets.yaml
kubectl apply -f k8s\configmaps\config.yaml

echo [3/6] Deploying infrastructure...
kubectl apply -f k8s\deployments\postgres.yaml
kubectl apply -f k8s\deployments\rabbitmq.yaml
kubectl apply -f k8s\deployments\redis.yaml
kubectl apply -f k8s\deployments\minio.yaml
kubectl apply -f k8s\services\infrastructure.yaml

echo Waiting for infrastructure...
kubectl wait --for=condition=available deployment/procureai-postgres -n %NAMESPACE% --timeout=120s
kubectl wait --for=condition=available deployment/procureai-rabbitmq -n %NAMESPACE% --timeout=120s
kubectl wait --for=condition=available deployment/procureai-redis -n %NAMESPACE% --timeout=60s

echo [4/6] Deploying Java services...
kubectl apply -f k8s\deployments\auth-service.yaml
kubectl apply -f k8s\deployments\api-gateway.yaml
kubectl apply -f k8s\deployments\user-service.yaml
kubectl apply -f k8s\deployments\procurement-service.yaml
kubectl apply -f k8s\deployments\rfq-service.yaml
kubectl apply -f k8s\deployments\quotation-service.yaml
kubectl apply -f k8s\deployments\supplier-service.yaml
kubectl apply -f k8s\deployments\invoice-service.yaml
kubectl apply -f k8s\deployments\notification-service.yaml
kubectl apply -f k8s\deployments\ocr-service.yaml
kubectl apply -f k8s\deployments\ai-service.yaml
kubectl apply -f k8s\deployments\frontend.yaml

echo [5/6] Creating services...
kubectl apply -f k8s\services\java-services.yaml

echo [6/6] Deploying ingress, autoscaling, disruption budgets...
kubectl apply -f k8s\ingress\nginx-ingress.yaml
kubectl apply -f k8s\hpa\horizontal-pod-autoscalers.yaml
kubectl apply -f k8s\pdb\pod-disruption-budgets.yaml

echo.
echo === Deployment Complete ===
echo Check status: kubectl get pods -n procureai
