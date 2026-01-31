# 📌 Three-Tier Node.js Application with Docker, Kubernetes, EKS, HPA, Ingress & Monitoring

This repository documents a **complete end-to-end backend system** built using **Node.js, MongoDB, Docker, Kubernetes, AWS EKS, Prometheus, Grafana, and Argo CD**.



---

## 📖 Commands to Run the Project

---

## 🗄 MongoDB Setup Using Docker

### 1. Command to run MongoDB using Docker

```
docker run -d \
 --name mongodb \
 -p 27017:27017 \
 -v mongo-data:/data/db \
 mongo
```

### To test MongoDB locally

#### Use below command to go into MongoDB shell

```
docker exec -it mongodb mongosh
```

#### Show databases in MongoDB

```
show dbs
exit
```

---

## ⚙️ Node.js Backend Project Setup

### Initialize Node.js project

```
npm init -y
```

### Install required packages

```
npm install express mongoose
```

### Start Node.js backend

```
node server.js
```

---

## 📂 View Data in MongoDB Locally

### Access MongoDB

```
docker exec -it mongodb mongosh
show dbs
use taskdb
```

### Show collections

```
show collections
```

### View data in collection

```
db.tasks.find().pretty()
```

> `tasks` is the collection name obtained from `show collections`

---

## 🐳 Creating a Dockerfile for the Application

The Dockerfile for the backend application is already created inside the backend folder.

---

## 🚀 Build & Push Docker Image

### Build Docker image

```
docker build -t chaitanyamunje08/task-app-backend:1.2 .
```

### Push Docker image to Docker Hub

```
docker push chaitanyamunje08/task-app-backend:1.2
```


### Single command to build & push (Mac – linux/amd64)

```
docker buildx build --platform linux/amd64 \
 -t chaitanyamunje08/task-app-backend:1.2 --push .
```

---

## ☸️ Kubernetes Configuration Files

A dedicated Kubernetes folder contains multiple YAML files:

```
backend.yml   -> Deployment & Service for Node.js app
config.yml    -> Configurations (e.g., port)
mongo.yml     -> MongoDB Deployment & Service
namespace.yml -> Namespace definition
secrets.yml   -> Secrets (MongoDB URL)
eks-ingress.yml -> This file is created for ingress which is to be used in AKS. 
hpa.yml -> This file is used for horizontal pod auto scaling in kubernetes cluster. 
ingress.yml -> This file is used for ingress for local kubernetes cluster. 

```

---

## 🚀 Running Application on Minikube

### Start Minikube

```
minikube start
```

### Check Minikube status

```
minikube status
```

### Open Minikube dashboard

```
minikube dashboard
```

---

## 📦 Apply Kubernetes Configurations

Apply each YAML file:

```
kubectl apply -f (file_name.yml)
```

This creates nodes and deploys containers.

---

## 🔄 Pod Restart & Self-Healing

### Delete all pods to test auto-restart

```
kubectl delete pod -n 3-tier-app --all
```

Pods will restart automatically.

---

## 📈 Scaling Kubernetes Deployment

### Scale replicas manually

```
kubectl scale deployment task-api --replicas=5 -n 3-tier-app
```

---

## 🔁 Horizontal Scaling (Concept)

Horizontal saling is generally used to increase number of pods if the traffic is increased.
Horizontal scaling = adding more instances to the application.
In k8s horizontal scaling is increasing number of pods.

Horizontal scaling = increasing number of pods.

```
1 pod -> 3 pods -> 5 pods
```

When traffic increases, in that case more request are recieved and CPU usage increases. In that case horizontal scaling is used.

### Why it works well here

✔ Node.js app is stateless  
✔ No local storage  
✔ No in-memory sessions  
✔ External database  

### Real example

```
1 pod handles 100 req/sec
Traffic spikes to 400 req/sec
HPA scales to 4 pods
```

### Horizontal Scaling Summary

| Feature | Horizontal Scaling |
|------|----------------|
| Method | Add pods |
| Kubernetes Support | Native |
| Auto-scaling | ✅ |
| Best for | Stateless apps |
| Downtime | None |
| Cloud Friendly | ✅ |

---

## ⬆️ Vertical Scaling

Vertical scaling = increasing CPU/memory for same pod.

Example:
```
CPU: 500m → 2000m
Memory: 256Mi → 2Gi
```

### Limitations

❌ Requires pod restart  
❌ Downtime risk  

### Vertical Scaling Summary

| Feature | Vertical Scaling |
|------|----------------|
| Method | Increase resources |
| Restart required | ✅ |
| Auto-scaling | ⚠️ |
| Best for | Stateful apps |
| Kubernetes-native | ❌ |

---

## 🔍 Horizontal vs Vertical Scaling

| Feature | Horizontal | Vertical |
|------|----------|----------|
| Scale Type | Pods | Resources |
| Restart Needed | ❌ | ✅ |
| Kubernetes Support | ✅ | ⚠️ |
| Cloud Native | ✅ | ❌ |

---

## 🎯 Kubernetes Scaling Philosophy

Kubernetes prefers **horizontal scaling**.

Pods are designed to:
- Die
- Restart
- Scale dynamically

---

## 📌 Interview-Ready Explanation

> “We scale application pods horizontally using HPA because they are stateless and Kubernetes is optimized for this model. Vertical scaling is limited and mainly used for stateful workloads.”

---

## ⚙️ Enabling Horizontal Pod Autoscaling (HPA)

### Prerequisite 1: Metrics Server

Check:
```
kubectl top pods -n 3-tier-app
```

If not installed:
```
minikube addons enable metrics-server
```

---

### Prerequisite 2: Resource Requests & Limits

HPA scales based on **percentage of requested CPU**.

Without this:
❌ HPA won’t work

---

## 📄 HPA Configuration

Created `hpa.yml` file.

### Key Configurations

```
minReplicas: 2
maxReplicas: 10
averageUtilization: 70
```

Apply HPA:
```
kubectl apply -f hpa.yml
kubectl get hpa -n 3-tier-app
```

---

## 🧪 Testing HPA

### Generate load

```
kubectl run -it load-generator \
 --rm \
 --image=busybox \
 --restart=Never \
 -n 3-tier-app -- sh
```

```
while true; do wget -q -O- http://task-api-service:3000/; done
```

---

## ❤️ Kubernetes Probes

### Probe Types

1️⃣ **Liveness Probe** – restarts unhealthy container  
2️⃣ **Readiness Probe** – controls traffic

### Key Rule

```
Readiness controls traffic
Liveness controls restarts
```

---

## 🛠 Applying Probes

Apply deployment:
```
kubectl apply -f app.yml
```

Watch pods:
```
kubectl get pods -n 3-tier-app -w
```

Describe pod:
```
kubectl describe pod <pod-name> -n 3-tier-app
```

---

## 🌐 Ingress (Concept)

Ingress provides:
- Clean URLs
- Domain routing
- HTTPS
- Single entry point

Ingress ≠ Ingress Controller

---

## 🌐 Ingress Implementation (Minikube)

Enable controller:
```
minikube addons enable ingress
```

Apply ingress:
```
kubectl apply -f ingress.yml
```

Edit `/etc/hosts`:
```
<minikube-ip> task-api.local
```

Test:
```
curl http://task-api.local/
```

---

## 📊 Prometheus

Prometheus:
- Collects metrics
- Stores time-series data
- Uses pull model

Monitors:
- Cluster
- Pods
- Nodes

---

## 📈 Grafana

Grafana:
- Visualizes metrics
- Uses Prometheus as data source

---

## 📦 Install Prometheus & Grafana using Helm

```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
kubectl create namespace monitoring
helm install prometheus prometheus-community/kube-prometheus-stack -n monitoring
```

---

## 🔍 Access Prometheus

```
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring
```

---

## 📊 Access Grafana

Get password:
```
kubectl get secret prometheus-grafana -n monitoring \
 -o jsonpath="{.data.admin-password}" | base64 --decode
```

Port forward:
```
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring
```

---

## ☁️ EKS Architecture

```
Internet
 |
 AWS ALB
 |
 Kubernetes Service
 |
 Node.js Pods (HPA)
 |
 MongoDB Atlas
```

Monitoring:
```
Prometheus → Grafana
```

---

## 🚀 Deploying to EKS

### Create cluster

```
eksctl create cluster --name three-tier-cluster --region ap-south-1 \
 --nodegroup-name standard-workers --node-type t3.medium \
 --nodes 2 --nodes-min 2 --nodes-max 3 --managed
```

---

## 🔐 AWS Load Balancer Controller

Steps included:
- IAM OIDC
- IAM Policy
- Service Account
- Helm Installation

Verification:
```
kubectl get pods -n kube-system | grep aws-load-balancer-controller
```

---

## 🌍 ALB Ingress (EKS)

Apply ingress:
```
kubectl apply -f eks-ingress.yml
kubectl get ingress -n 3-tier-app
```

---

## 🧹 Cleanup

Delete ingress:
```
kubectl delete ingress task-api-ingress -n 3-tier-app
```

Delete cluster:
```
eksctl delete cluster --name three-tier-cluster --region ap-south-1
```

---

## 🔄 Argo CD Setup

```
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml
kubectl patch svc argocd-server -n argocd -p '{"spec":{"type":"NodePort"}}'
kubectl port-forward -n argocd svc/argocd-server 8443:443
```

Get password:
```
kubectl get secret -n argocd argocd-initial-admin-secret \
 -o jsonpath="{.data.password}" | base64 -d
```

---

## 🎯 Final Notes

✔ No content removed  
✔ Only formatting & structure added  
✔ Production-grade Kubernetes & EKS workflow  
✔ Fully interview-ready documentation  

---

### 🚀 End-to-End Cloud-Native Backend – Complete & Production Ready 🎉
