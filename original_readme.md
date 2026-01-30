Commands to run the project

1. Command to run mongo db using docker :

docker run -d \
 --name mongodb \
 -p 27017:27017 \
 -v mongo-data:/data/db \
 mongo

To test mongo db locally.

# Use below command to go into mongo db to access db through mongo shell.

docker exec -it mongodb mongosh

# Then we can simply call below command to show dbs in mongodb.

show dbs
exit

2. Command to create node js backend project.

# To initlaize the project.

npm init -y

# To install mongoose package.

npm install express mongoose

# Start node js project using below command :

node server.js

# View data in mongo db locally.

Use below command to go inside the databse.

docker exec -it mongodb mongosh
show dbs
use taskdb

# Use below command to show the collections in db.

show collections

# Use below command to view the data in the collection.

db.tasks.find().pretty()
In the above command tasks is the collection name which we will get from the show collections command.

## Creating a docker file for the application

Now we have already created the docker file for backend application which is present in our backend folder.

Now we have to build the docker image and deploy this to docker hub.

# Use below command to build the docker image.

docker build -t chaitanyamunje08/task-app-backend:1.2 .

# Use below command to push the docker image to docker hub.

docker push chaitanyamunje08/task-app-backend:1.2

# Use one single command to build and push dockr image to docker registry.

This command is specifically used for mac machine to build and push images with linux/amd64 architecture
docker buildx build --platform linux/amd64 -t chaitanyamunje08/task-app-backend:1.2 --push .

## Now working on kubernetes part of the application

We have to created a folder for kubernetes with multiple files
backend.yml -> this file contains the deployment as well as service for our node js web application.
config.yml -> this file contains the configurations which are required for our node js web app such as port number for our project.
mongo.yml -> this file contains the deployment and service for our mongo db databaase.
namespace.yml -> this file contains the yml for our namespace for our project.
secrets.yml -> this file contains the secrets for our project such as mongo db database url.

# Now running our node js web app locally in minikube.

Start minikube cluster using below command.
minikube start

# To check the status for our minikube cluster use below command.

minikube status

# To open minikube dashboard use below command.

minikube dashboard

# Now we have to use below commands to apply kubernets config to all the files in k8s folder

kubectl apply -f (file_name.yml)

Running above command for all the files.yml will create a nodes and your containers will be added to it.

# Deleting the pods in kubernetes cluster to check weather they are restarted automatically or not.

kubectl delete pod -n 3-tier-app --all

Once the above command is triggered it will delete all the pods present in cluster, and the pods will be automatically restarted.

# To scale our kubernetes cluster use below command.

Now as of now for our backend api we are having by default 2 replicas. In future if the demad to our app increases in that case we have to scale our application and we have to increase the number of replicas. For increasing replicas and scaling it up we can use below command.

kubectl scale deployment task-api --replicas=5 -n 3-tier-app

# Horizontal Scaling

Horizontal saling is generally used to increase number of pods if the traffic is increased.
Horizontal scaling = adding more instances to the application.
In k8s horizontal scaling is increasing number of pods.
1 pod -> 3 pod -> 5 pod

When traffic increases, in that case more request are recieved and CPU usage increases. In that case horizontal scaling is used.

Why horizontal scaling works well in our current application.
✔ Node.js app is stateless
✔ No local file storage
✔ No in-memory user sessions
✔ DB is external

This is exactly what Kubernetes is designed for.

Real example

Let’s say:

1 pod can handle 100 requests/sec

Traffic spikes to 400 requests/sec

HPA result:
1 pod → 4 pods

No code change. No restart. No downtime.

Horizontal scaling summary
Feature Horizontal Scaling
Method Add pods
Kubernetes support Native
Auto-scaling ✅ (HPA)
Best for Stateless apps
Downtime None
Cloud-friendly ✅

# Vertical Scaling

Vertical Scaling (Scale UP)
🔹 What it means

Vertical scaling = giving more resources to the same instance.

In Kubernetes terms:

Increase CPU / Memory of a pod

Example:

CPU: 500m → 2000m
Memory: 256Mi → 2Gi

Vertical scaling in YOUR app

Instead of running:

3 small pods

You run:

1 very powerful pod

With more:

CPU
Memory

Important limitation (CRITICAL)

To apply vertical scaling:
Pod must be restarted
Why?
CPU/memory are assigned at pod creation
This means:
❌ Downtime (unless multiple replicas exist)

Vertical scaling summary
Feature Vertical Scaling
Method Increase CPU/memory
Requires restart ✅
Auto-scaling ⚠️ Limited
Downtime risk ⚠️
Best for Stateful apps
Kubernetes-native ❌ (limited)

Horizontal vs Vertical — Side-by-side
Feature Horizontal Vertical
Scale type Pods Resources
Restart needed ❌ ✅
Kubernetes support ✅ ⚠️
Works with HPA ✅ ❌
Works well with stateless apps ✅ ❌
Cloud-native ✅ ❌

What does Kubernetes actually prefer?

Kubernetes is built for horizontal scaling

Everything in Kubernetes assumes:

Pods can die

Pods can be replaced

More pods can be added

Vertical scaling breaks this model.

How REAL production systems do it (IMPORTANT)
✅ Backend services (your Node.js app)

Horizontal scaling

HPA enabled

Small pods

Many replicas

⚠️ Databases

Vertical scaling (sometimes)

OR managed scaling (Atlas handles this)

You never vertically scale application pods as a primary strategy.

Interview-ready explanation (memorize this)
“We scale application pods horizontally using HPA because they are stateless and Kubernetes is optimized for this model. Vertical scaling is limited in Kubernetes and usually reserved for stateful workloads or managed databases.”

# Enabling Horizontal Scaling for our project.

PHASE 1: What HPA NEEDS (Prerequisites)

HPA cannot magically scale pods. It needs metrics.

✅ Requirement 1: Metrics Server

HPA uses CPU/memory metrics from metrics-server.

Check:

kubectl top pods -n 3-tier-app

If this works → metrics server is installed.

If not (Minikube) use below command to install it:

minikube addons enable metrics-server

📌 In EKS, metrics-server is installed separately (later).

✅ Requirement 2: Resource requests & limits (MANDATORY)

HPA scales based on percentage of requested CPU, not absolute usage.

Without this:
❌ HPA will not work
❌ You’ll get confusing errors

So first we update the Deployment file for backend.yml.

I have added comments in deployment.yml file for backend.yml to enable HPA.

Explanation of updated code in backend.yml file for HPA :

Why these values?
Let’s explain clearly:

requests.cpu: 100m

Pod is guaranteed 0.1 CPU

HPA uses this as 100% reference

limits.cpu: 500m

Pod cannot exceed 0.5 CPU

Prevents one pod from hogging node CPU

Memory limits

Prevent OOM crashes

Good production hygiene

Steps : Creating a HPA (Horizontal Pods Actuator) in a seperate yml file.
I have created a file named as hpa.yml and added the code inside it.
Explanation of code is given below :

Line-by-line explanation (IMPORTANT)
scaleTargetRef
name: task-api

➡️ HPA will scale this Deployment

minReplicas: 2

Never scale below 2 pods

Avoid single-point failure

maxReplicas: 10

Safety cap

Prevent runaway scaling

averageUtilization: 70

If average CPU usage across pods > 70%

HPA adds more pods

Apply HPA
kubectl apply -f hpa.yml

To check hpa in action use below command to view the hpa.
kubectl get hpa -n 3-tier-app

# Testing Horizontal Scaling for our application.

To test HPA we have to add load on our service and cluster to test actual scenario.

To generate load we have to use below command :
kubectl run -it load-generator \
 --rm \
 --image=busybox \
 --restart=Never \
 -n 3-tier-app -- sh

After executing the above one we have to hit below url to do regression test on our cluster
while true; do wget -q -O- http://task-api-service:3000/; done

Use above command to do regression.
We can check the status for the pods using get pods methods.

Interview-ready summary

“We enable horizontal scaling using HPA based on CPU utilization. Each pod defines resource requests and limits, allowing Kubernetes to calculate scaling decisions reliably.”

# Probes in Kubernetes

What are probes?

Probes are health checks that Kubernetes uses to decide:

Is the container alive?

Is the container ready to receive traffic?

Kubernetes does not assume your app is healthy just because the process is running.

Types of probes (VERY IMPORTANT)
1️⃣ Liveness Probe

“Is this container stuck or broken?”

If it fails:

Kubernetes restarts the container

Example:

App is running but stuck in deadlock

No response

Liveness probe fails

Pod restarts automatically

2️⃣ Readiness Probe

“Should this pod receive traffic?”

If it fails:

Pod stays running

BUT removed from Service endpoints

No traffic sent to it

Example:

App started but DB connection not ready

Readiness fails

Traffic waits

Once DB is ready → traffic resumes

🔹 Why probes are CRITICAL for your app
Without probes ❌

Traffic sent to:

Pods still starting

Pods that lost DB connection

Causes random failures

With probes ✅

Only healthy pods get traffic

HPA scaling is stable

Zero-downtime deployments

🔹 Real example (your app)

You already have:

GET /
→ "Task API server is running"

Perfect probe endpoint.

🔥 Key rule (INTERVIEW IMPORTANT)

Readiness controls traffic
Liveness controls restarts

# Impementing Probes in our kubernetes application.

We have updated backend.yml file i have added commens while updating this file as well. Below i am describing the each code line by line.

🔍 Line-by-line explanation (VERY IMPORTANT)
🔹 readinessProbe
initialDelaySeconds: 10

Give app 10s to start

Prevent traffic too early

periodSeconds: 5

Check every 5 seconds

failureThreshold: 3

Fail 3 times → remove from Service

👉 No traffic until healthy

🔹 livenessProbe
initialDelaySeconds: 30

App + DB connection need time

Avoid premature restarts

periodSeconds: 10

Less frequent

Avoid unnecessary restarts

failureThreshold: 3

Restart only if consistently unhealthy

👉 Self-healing behavior

🔹 PHASE 4: Apply and Observe
1️⃣ Apply updated Deployment
kubectl apply -f app.yml

2️⃣ Watch pod status
kubectl get pods -n 3-tier-app -w

You’ll see:

0/1 → 1/1 READY

Only when readiness probe passes.

3️⃣ Describe pod (VERY USEFUL)
kubectl describe pod <pod-name> -n 3-tier-app

Look for:

Readiness probe succeeded
Liveness probe succeeded

4️⃣ Test failure scenario (optional but powerful)

Kill Node.js process inside pod:

kubectl exec -it <pod> -n 3-tier-app -- sh
kill 1

What happens:

Liveness probe fails

Container restarts automatically

🎉 Self-healing verified

🧠 Why probes matter EVEN MORE with HPA

Without probes:

HPA may route traffic to unhealthy pods

Scaling becomes unstable

With probes:

Only healthy pods receive traffic

Scaling is smooth and reliable

🧠 Interview-ready explanation (memorize)

“We use readiness probes to control traffic flow and liveness probes for self-healing. This ensures zero-downtime deployments and stable autoscaling.”

# WHat is Ingress ?

What is Ingress? (Concept, deeply explained)
🔹 The problem Ingress solves

Right now you are accessing your app like this:

http://<NODE-IP>:30007/

This works, but it has serious problems:

❌ Random high port (30007)
❌ Node IP dependency
❌ No domain name
❌ No HTTPS
❌ Hard to manage multiple services

This is not production-grade.

🔹 What Ingress actually is

Ingress is NOT a load balancer by itself.
It is a set of routing rules that control how external HTTP/HTTPS traffic enters your cluster.

Ingress says things like:

“If request comes to /, send it to backend service”

“If request comes to /api, send it to another service”

“Use HTTPS”

“Use this domain name”

🔹 Very important distinction (MOST PEOPLE MISS THIS)
❌ Ingress ≠ Ingress Controller
Component What it does
Ingress Rules (YAML)
Ingress Controller Actual traffic handler

Ingress needs a controller to work.

🔹 Traffic flow WITH Ingress (your app)
User
|
| http://task-api.local/
|
Ingress Controller (NGINX / ALB)
|
Service (task-api-service)
|
Node.js Pods (HPA + probes)

Ingress:

Accepts HTTP request

Applies routing rules

Forwards traffic to Service

Service forwards to Pods

🔹 Why Service is still needed

Ingress never talks to Pods directly.

It always routes to a Service, and the Service load-balances to Pods.

🔹 Why Ingress is critical in production

Ingress gives you:

✅ Clean URLs
✅ Domain-based routing
✅ Path-based routing
✅ HTTPS / TLS
✅ One entry point for many services
✅ Works with HPA & probes
✅ Cloud load balancer integration (EKS ALB)

🔹 Example: without vs with Ingress
❌ Without Ingress
Frontend → NodePort → Pod

✅ With Ingress
Frontend → https://api.mycompany.com → Ingress → Service → Pods

# Implementation of Ingress in our project.

STEP 1️⃣ Enable Ingress Controller in Minikube

Run:

minikube addons enable ingress

Verify:
kubectl get pods -n ingress-nginx

STEP 2️⃣ Confirm your Service (already exists)

STEP 3️⃣ Create Ingress YAML (Created in k8s folder)

🔍 Line-by-line explanation (IMPORTANT) for ingress.yml file.
🔹 host: task-api.local

This is the domain name you’ll use locally.

🔹 path: /

All traffic to / goes to backend service.

🔹 service.name

Ingress sends traffic to:

task-api-service

🔹 port: 3000

Must match Service port.

STEP 4️⃣ Apply Ingress
kubectl apply -f ingress.yml

Verify:

kubectl get ingress -n 3-tier-app

STEP 5️⃣ Map domain locally (IMPORTANT)

Get Minikube IP:

minikube ip

Example:

192.168.49.2

Edit /etc/hosts:

sudo nano /etc/hosts

Add:

192.168.49.2 task-api.local
And save it.

STEP 6️⃣ Test Ingress 🎉

Open browser or curl:

curl http://task-api.local/

# Promethus

🔹 What is Prometheus? (simple but accurate)

Prometheus is a metrics collection and storage system designed for cloud-native and Kubernetes environments.

Prometheus:

Periodically scrapes metrics
Stores them as time-series data
Allows querying using PromQL

It answers questions like
“How much CPU is this pod using over time?”
“How many pods are running right now?”

Why Prometheus is NEEDED (your project context)

Right now, in your project:

✔ Pods auto-scale
✔ Ingress routes traffic
✔ MongoDB is external

But you cannot see:
When scaling happens
Why scaling happens

Prometheus uses a pull model:

Prometheus → /metrics endpoint → Pod / Node

This is important because:

No agent inside your app (initially)
No tight coupling
Kubernetes-friendly

🔹 What Prometheus monitors in Kubernetes

Prometheus does NOT monitor just your app.
It monitors everything:

🔹 Cluster-level
🔹 Kubernetes objects
🔹 Application-level (later)

🔹 Prometheus architecture (mental model)
[ Kubernetes Objects ]
|
| metrics
|
[ Prometheus Server ]
|
Time-series DB
|
[ Query Layer (PromQL) ]

🔹 Benefits of Prometheus (production reasons)
✅ 1. Kubernetes-native

Designed for ephemeral pods
Handles dynamic targets

✅ 2. Powerful querying (PromQL)
You can ask:

“Average CPU usage over last 5 minutes”
“Pods with memory leaks”

✅ 3. Foundation for alerting

Prometheus feeds:

Alertmanager
PagerDuty / Slack / Email

✅ 4. Open-source & cloud agnostic

Same setup for:
Minikube
EKS

# Grafanna

🔹 What is Grafana?

Grafana is a visualization and dashboarding tool.

Grafana:
Does NOT collect metrics
Connects to Prometheus
Shows graphs, charts, tables

Grafana answers:
“Show me CPU usage visually”
“Show pod scaling over time”

🔹 Why Grafana is needed (even if Prometheus exists)

Prometheus stores raw numbers.

Without Grafana:
You read numbers

With Grafanna :
You can view the dashboards.

🔹 Grafana architecture (mental model)
Prometheus (Data Source)
|
|
Grafana
|
Dashboards

🔹 What Grafana will show in YOUR project
🔹 Infrastructure dashboards

Node CPU / memory
Pod CPU / memory
Pod restarts
HPA scaling behavior

🔹 Application dashboards (later)

Request rate
Latency
Error rate

🔹 Benefits of Grafana (production reasons)
✅ 1. Real-time visibility
✅ 2. Ready-made dashboards
✅ 3. Alerts (later)

🔑 Prometheus vs Grafana (VERY IMPORTANT)
Tool Does
Prometheus Collects & stores metrics
Grafana Visualizes metrics
Both together Full observability

🧠 Interview-ready explanation (save this)

“We use Prometheus for collecting Kubernetes and application metrics and Grafana for visualizing them. Prometheus integrates deeply with Kubernetes and Grafana provides real-time dashboards and alerting.”

# Setting up Promethus for our Project.

For installating promtehus in pur project we will be using helm package manager to install promethus.

Helm : Helm is a kubernetes package manager or a registry which we can use to download and use packages in kubernetes. We will be using helm to install promethus and grafanna.

📦 STEP 1 — Add Prometheus Helm repository

Use below command to install prometheus package using helm.
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts

Use below commad to update helm repo.
helm repo update

Creating a seperate namespace for promethus.
kubectl create namespace monitoring

Install promethus in new namespace monitoring using below command.
helm install prometheus \
 prometheus-community/kube-prometheus-stack \
 -n monitoring

Use below command to view pods in monitoring namespace .
kubectl get pods -n monitoring

STEP 2 — Access Prometheus UI (Local)

We’ll use port-forwarding. Using below command.
To get svc we will be using below command :
kubectl get svc -n monitoring

Use below command to port forward service and view promethus dashboard.
kubectl port-forward svc/prometheus-kube-prometheus-prometheus 9090:9090 -n monitoring

# Setting up grafanna for our project.

As we have installed promethus community using helm this will also install grafanna dashboard with it.

Now grafanna credentials are stored in kubernetes secret we can use below command to get it.
kubectl get secret \
 prometheus-grafana \
 -n monitoring \
 -o jsonpath="{.data.admin-password}" | base64 --decode

08ciofUVcR2EQDZd7cFKgYJD8lKLRuBTUkK2TTJb

Output of the above command is : --> UMeTEn1GLht49JolO0sJdhcDCXaRuWyFeIWKaCxv

By default user name for grafanna is : ---> admin

Now to run grafanna dashboard we have to use below command :
kubectl port-forward svc/prometheus-grafana 3000:80 -n monitoring

Now we can test the grafanna dashboard by adding a load to it by the method which we have used for HPA.

# EKS Architecture for our application.

Internet
|
AWS ALB (Ingress)
|
Kubernetes Service (ClusterIP)
|
Node.js Pods (HPA enabled)
|
MongoDB Atlas (external)

Monitoring:
Prometheus → Grafana

# Deployment of our project to EKS.

# Phase 1 ----> Setting up EKS Infrastructure (foundation)

Verify the account weather it is logged in or not using below command
aws sts get-caller-identity

Use below command to create your eks cluster
eksctl create cluster --name three-tier-cluster --region ap-south-1 --nodegroup-name standard-workers --node-type t3.medium --nodes 2 --nodes-min 2 --nodes-max 3 --managed

Explanation of above command :
🧠 What this command does (VERY IMPORTANT)
Flag Meaning
--name EKS cluster name
--region AWS region
--nodegroup-name Worker node group
--node-type EC2 instance type
--nodes Initial nodes
--nodes-min/max For future auto-scaling
--managed AWS-managed node group

Use below commands to view nodes in eks cluster
kubectl get nodes

Use below command to get current-context for the eks
kubectl config current-context

The above command os used to refer that we are actually using kubectl for eks.

🧠 What AWS created for you (important understanding)

eksctl automatically created:

VPC
Subnets (public + private)
Internet Gateway
NAT Gateway
Security Groups
EC2 instances
IAM roles
EKS control plane
This is production-grade infra.

🧠 Interview-ready explanation

“We created an EKS cluster using eksctl with managed node groups. eksctl provisions the VPC, IAM roles, and networking automatically, giving us a production-ready Kubernetes cluster.”

# Phase 2 ----> IAM & AWS Load Balancer Controller

🔹 Why this phase is REQUIRED

In Minikube:

Ingress controller runs inside the cluster

No cloud permissions needed

In EKS:

Ingress creates real AWS resources:

ALB
Target Groups
Listeners
Security Groups

👉 Kubernetes cannot talk to AWS APIs by default

So we must securely allow Kubernetes to call AWS APIs.

🔹 What tool enables this?

👉 AWS Load Balancer Controller

It is a Kubernetes controller that:
Watches Ingress resources
Calls AWS APIs
Creates & manages ALBs automatically
This controller talks to Amazon Web Services on your behalf.

🔹 Why IAM OIDC is CRITICAL (don’t skip this)

In modern EKS:

We DO NOT give AWS credentials to pods

We use IAM Roles for Service Accounts (IRSA)

OIDC allows:
Kubernetes ServiceAccount → IAM Role → AWS APIs

✔ Secure
✔ Least privilege
✔ Production-grade

✅ Step 1: Enable IAM OIDC provider
We have to run below command to enable iam oidc provider :

eksctl utils associate-iam-oidc-provider \
 --cluster three-tier-cluster \
 --region ap-south-1 \
 --approve

✅ Step 2: Create IAM Policy for ALB Controller
Download the IAM policy for ALB using below command :

curl -o iam-policy.json \
https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/main/docs/install/iam_policy.json

Create the policy in aws using below command :

aws iam create-policy \
 --policy-name AWSLoadBalancerControllerIAMPolicy \
 --policy-document file://iam-policy.json

Using the above command we will get json output from which Arn is useful for us which is as below :

"Arn": "arn:aws:iam::566849586744:policy/AWSLoadBalancerControllerIAMPolicy",

✅ Step 3: Create IAM role + Kubernetes ServiceAccount

eksctl create iamserviceaccount \
 --cluster three-tier-cluster \
 --namespace kube-system \
 --name aws-load-balancer-controller \
 --attach-policy-arn arn:aws:iam::566849586744:policy/AWSLoadBalancerControllerIAMPolicy \
 --override-existing-serviceaccounts \
 --region ap-south-1 \
 --approve

✅ Step 4: Install AWS Load Balancer Controller (via Helm)
Use below command to add helm repo

helm repo add eks https://aws.github.io/eks-charts
helm repo update

Imstalling aws load balancer controller
Use below command to install aws load balancer

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
 -n kube-system \
 --set clusterName=three-tier-cluster \
 --set serviceAccount.create=false \
 --set serviceAccount.name=aws-load-balancer-controller \
 --set region=ap-south-1 \
 --set v=2

✅ Step 5: Verify controller is running
kubectl get pods -n kube-system | grep aws-load-balancer-controller

The above command should show running status for pods.

✅ Step 6: Check controller logs (sanity check)
kubectl logs -n kube-system \
 deploy/aws-load-balancer-controller

Check if no permission related issues are observed.

🧠 What you unlocked after Phase 2

Now your EKS cluster can:

✅ Create Application Load Balancers
✅ Manage Target Groups
✅ Route traffic via Ingress
✅ Scale ALB automatically
✅ Integrate cleanly with HPA

🧠 Interview-ready explanation (save this)

“In EKS, we enable IAM OIDC and use IRSA to grant the AWS Load Balancer Controller permissions to create and manage ALBs securely. This allows Kubernetes Ingress resources to provision AWS load balancers automatically.”

# Phase 3 ----> Deploying k8s folder yml file in EKS cluster.

Apply all the files using below commands :
kubectl apply -f (file_name.yml)

🧠 Why Phase 3 is production-ready

✔ Namespace isolation
✔ Secrets & ConfigMaps
✔ Probes for stability
✔ HPA for scaling
✔ External DB (no PVs)
✔ ClusterIP (secure by default)

This is exactly how real teams deploy backend services.

🧠 Interview-ready explanation

“We deploy application workloads using Kubernetes Deployments and Services in a dedicated namespace. Configuration is managed via ConfigMaps and Secrets, autoscaling via HPA, and health via probes.”

TIP : While using any docker image in EKS cluster, make sure it is linux/amd64 based architecture.

# Phase 4 ----> ALB and INgress.

Architecture flow for ALB
Internet
|
AWS ALB (managed)
|
Ingress rules
|
Service (ClusterIP)
|
Node.js Pods (HPA)

To check weather AWS load balancer controller is running use below command :
kubectl get pods -n kube-system | grep aws-load-balancer-controller

Now for EKS load balancer we will be creating an ingress file for EKS cluster named as eks-ingress.yml in which we have added code, below is the detailed explanation for it :

🔍 Line-by-line explanation (VERY IMPORTANT)
🔹 kubernetes.io/ingress.class: alb

Tells Kubernetes:

“This Ingress must be handled by AWS ALB controller”

🔹 alb.ingress.kubernetes.io/scheme: internet-facing

ALB will be public

Accessible from the internet

(Use internal for private APIs)

🔹 alb.ingress.kubernetes.io/target-type: ip

ALB routes traffic directly to pods

Required for EKS + HPA

🔹 listen-ports

ALB listens on port 80 (HTTP)

HTTPS will be added later

🔹 Backend service

Ingress never talks to pods directly
It routes traffic to:

task-api-service:3000

Now we have to apply this file using below command :
kubectl apply -f eks-ingress.yml

After applying this file we have to see our ingress using below command which will display address :

kubectl get ingress -n 3-tier-app
We will get the address which is used to view our application.

In current case we are getting below URL :
http://k8s-3tierapp-taskapii-efe3fb8f16-166618370.ap-south-1.elb.amazonaws.com/tasks

Verify ALB in AWS Console (optional but good)

🧠 What you achieved with Phase 4

✔ Production-grade public access
✔ No NodePort
✔ No manual AWS setup
✔ Fully managed ALB
✔ Works with HPA
✔ EKS best practice

This is exactly how backend APIs are exposed in real systems.

🧠 Interview-ready explanation (save this)

“We expose services in EKS using ALB Ingress. The AWS Load Balancer Controller provisions and manages Application Load Balancers automatically based on Kubernetes Ingress resources.”

# Deleting the cluster along with the ingress.

Use below command to delete the ingress :
kubectl delete ingress task-api-ingress -n 3-tier-app

Use below command to delete the cluster :
eksctl delete cluster \
 --name three-tier-cluster \
 --region ap-south-1

Verify is cluster is deleted
eksctl get clusters

# Setting up Argo CD for this project.

Creating a namespace for argo cd using below command.
kubectl create namespace argocd

Use below command to add manifest file for argo cd.
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

Use below command to patch the service.
kubectl patch svc argocd-server -n argocd -p '{"spec": {"type": "NodePort"}}'

Use below command to port forward the service for argo cd.
kubectl port-forward -n argocd service/argocd-server 8443:443

USe below command to get password for default user for argo cd.
kubectl get secret -n argocd argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo
