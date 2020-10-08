# Issues faced during the project

1. SSH forwarding for private `github` repository
2. Test with JavaScript
3. Making the app communicate using docker. 

The containerization of the app was smooth with the following `Dockerfile`.

```yml
FROM node:14
WORKDIR /app
COPY package*.json ./
COPY . .
```

Next the objective was to be able to launch two containers: 
- one with the `node.js` app
- one with Redis
- make them communicate

My first attempts were unsuccessful, with the following docker-compose file

```yml
version: "3"
services:
    # the node app
    web:
        depends_on:
            - db
        # to build use the local docker file
        build: .
        ports:
            - "3000:3000"
        environment:
            - REDIS_HOST=redis
            - REDIS_PORT=6739
        links:
            - "db"
        command: bash -c "npm install && npm start"
    db:
        image: docker.io/redis
```

The raised error said that the app cannot communicate with Redis. Even locally I need a running instance of Redis to start the app (with `npm start`). Based on this I followed the following reasoning:

- In the `conf/default.json` file we have the settings for Redis
```json
{
    "redis": {
        "host": "127.0.0.1",
        "port": 6739
    }
}
```
- This basically says that on the local machine you can communicate with Redis through port `6379`.
    
- But when the app runs on docker it is looking for the `localhost` that cannot
    be found. To circumvent this I thought about altering the `json` file as
    followed.

```json
{
    "redis": {
        "host": "Ip address of the Redis container",
        "port": 6739
    }
}
```

To get an idea about the docker network I ran the `docker network ls` command
that outputs this:

```
NETWORK ID          NAME                                    DRIVER              SCOPE
9f7413830f72        app_default                             bridge              local
b3553bfa743c        bridge                                  bridge              local
97ac91105966        devops-project-dsti-fall-2020_default   bridge              local
6e90e4603172        hello-world-compose-web-app_default     bridge              local
de35de46537e        host                                    host                local
6999bd9b60c0        none                                    null                local
```

We can get the CIDR block of each network / subnets by running the following commands:
```bash
docker network inspect -f '{{range .IPAM.Config}}{{.Subnet}}{{end}}' <network_id>

# for the default_app
docker network inspect -f '{{range .IPAM.Config}}{{.Subnet}}{{end}}' 9f7413830f72
=> 172.18.0.0/16

# For the bridge
docker network inspect -f '{{range .IPAM.Config}}{{.Subnet}}{{end}}' b3553bfa743c
172.17.0.0/16

# For my dsti_devops app with docker-compose
docker network inspect -f '{{range .IPAM.Config}}{{.Subnet}}{{end}}' 97ac91105966
172.27.0.0/16
```

>By default docker compose sets up a single network for your app. And your app’s network is given a name based on the “project name”, originated from the name of the directory it lives in. When you run your containers via `docker-compose` they are all connected to a common network. Service name is a DNS name of given container. Indeed from the point of view of my `web` container the `redis` is not running on the `localhost`. Instead it runs in it's own container which DNS name is `redis`.

One trick that works is to directly modify the `conf.default.json` file and specify the host as `redis`. By doing this we precise the DNS name and where to find it when using docker. The problem is that I have to alter the `config` file which then impacts the way the node app behaves locally.

```json
{
    "redis": {
        "host": "127.0.0.1",
        "port": 6739
    }
}
```


