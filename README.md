# DevOps Project

Herein, the main project's objective is to make a web application go through the main CI/CD steps, deploy the app using (i) a virtual environment with vagrant, (ii) using docker and docker compose and (iii) Kubernetes. A list of completed tasks can be seen below:

- [ ] **Complete the application code**
  - [x] Start a web server
  - [x] Create a user
  - [x] Get user data
  - [ ] Testing (One test missing in `test/user.router.js`)
- [x] **Apply CI/CD**
  - [x] Testing on Travis CI
  - [x] Deployment on [Heroku](https://faouzi-app-devops.herokuapp.com/)
- [ ] **Configure and provision a virtual environment and run your application using IaC approach**
  - [x] Use vagrant
  - [x] Provision the VM with Ansible to install and run (language runtime, database, git, ssh forwarding for private repository, app)
  - [ ] Provision Ansible playbook for Healthchecks
- [x] **Build Docker image of your application**
  - [x] Create Docker image of your application
  - [x] Push the image to Docker Hub
- [x] **Make docker orchestration using Kubernetes**
  - [x] Install Kubernetes cluster using Minikube
  - [x] Create a Kubernetes Manifest yaml files
- [ ] **Make a service mesh using Istio**
- [x] **Describe your project in the `README.md` file**



# User API web application

It is a basic NodeJS web application exposing REST API that creates and stores user parameters in [Redis database](https://redis.io/).



## Functionality

1. Start a web server
2. Create a user
3. Get user data



## Installation and usage

This application is written on NodeJS and it uses Redis database. There are different scenarios to install and run the application. See below for their descriptions.



### Local installation and usage

**Installation**

First check that both NodeJS and Redis are installed in your system. If not follow these two links and their respective installation guides:

- [Install NodeJS](https://nodejs.org/en/download/)

- [Install Redis](https://redis.io/download)

Once done you can clone or download the repository. Once in the root directory of the application (where `package.json` file is located) run the following command:

```bash
npm install
```

**Usage**

1. Start a web server

From the root directory of the project run:

```bash
npm start
```

It will start a web server available in your browser at http://localhost:3000.

1. Create a user

Send a POST (REST protocol) request using terminal:

```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"username":"fbraza","firstname":"faouzi","lastname":"braza"}' \
  http://localhost:3000/user
```

It will output:

```bash
{"status":"success","msg":"OK"}
```

2. Get user's data

```bash
curl http://localhost:3000/user/fbraza
```

It will output:

```bash
{"status":"success","msg":{"firstname":"Faouzi","lastname":"Braza"}}
```

**Testing**

From the root directory of the project, run:

```bash
npm test
```



### Docker installation and usage

**Installation**

First check that docker and docker-compose are installed in your system if not follow these links:

- Install [docker](https://docs.docker.com/get-docker/)
- Install [docker-compose](https://docs.docker.com/compose/install/)

> docker-compose needs to be installed separately only for Linux user. It is included  as part of Mac and Windows desktop installs

Once done you can clone or download the repository. Once in the root directory of the application (where `package.json` file located) run the following command:

```bash
COMPOSE_DOCKER_CLI_BUILD=1 docker-compose build
```

This will pull two images from the docker Hub ([Redis](https://hub.docker.com/_/redis), [our application](https://hub.docker.com/repository/docker/fbraza/webapp-v1)), build them, expose the relevant ports, mount the storage volumes. 

> COMPOSE_DOCKER_CLI_BUILD=1 force the use of the Buildkit to build the containers faster. It also takes into account the `dockerignore` file by default. This command is available from docker-compose 1.25.1. If you have older version use the classical `docker-compose build` which may not take into account the `dockerignore` file.

Next you can run the following command:

```bash
docker-compose up -d
```

This will make the two containers running in background.

**Usage**

After installation, a web server will be available in your browser at http://localhost:3000. You can also use the previous commands described previously to create users and get user's data.

**Testing**

The test suite has not been included in the docker image. All tests have been performed locally and then run on Travis CI before containerizing the app.



### Installation & deployment with Kubernetes

**Installation**

To be able to install and deploy the app on a local Kubernetes cluster first check that `kubectl` (Kubernetes CLI) and `minikube` (CLI to set up local Kubernetes cluster) are installed in your system. I chose to run `minikube` with the `docker` driver (so check that docker is installed if you follow the same path) but if you prefer you can use others container / virtual machine managers.

- Install [kubectl](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
- Install [minikube](https://minikube.sigs.k8s.io/docs/start/)
- Install [docker](https://docs.docker.com/get-docker/)

Once all required softwares are installed go to the root directory and run:

```
minikube start
```

This will build and start you local Kubernetes cluster. Then run:

```bash
kubectl apply -f k8s_manifests_distinct
```

This will set up two distinct pods in our cluster. One pod will run our application container and the other one will run the Redis container. A persistent storage will be attributed to the Redis container to save data.

**Usage**

To access the web server, create and get user data you first need to get the IP address of the running cluster. Because you are going to use it several time in your `curl` command, you can save it in a `bash` variable by running the following command:

```bash
CLUSTER_IP=$(minikube ip)
```

To expose the container in our pods we created Kubernetes services manifests and open some NodePort. To get the node port of our app we can run the following command:

```bash
kubectl get svc
```

This should output something similar to:

```bash
NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
faouzi-webapp-service   NodePort    10.102.58.222   <none>        3000:30867/TCP   5s
kubernetes              ClusterIP   10.96.0.1       <none>        443/TCP          2d9h
redis-service           NodePort    10.98.127.167   <none>        6379:31048/TCP   5s
```

Looking at the service named `faouzi-webapp-service` we can quickly find the node port which is `30867`. Save it to a bash variable

```bash
PORT=30867
```

Then to interact with the web server you can run:

```bash
curl http://${CLUSTER_IP}:${PORT}
```

This should return:

```bash
Hello World!
```

You can then use the commands described previously to create users and get users' data but be careful to put the right ip and port. 
Using the variables initialized previously should simplify the process:

1. To create user

```bash
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"username":"fbraza","firstname":"faouzi","lastname":"braza"}' \
  http://${CLUSTER_IP}:${PORT}/user
```

2. To get user's data
```bash
curl http://${CLUSTER_IP}:${PORT}/user/fbraza
```

# Author
Faouzi Braza

 [faouzi.braza@edu.dsti.institute](mailto:faouzi.braza@edu.dsti.institute)

