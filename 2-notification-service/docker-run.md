the complete working process from beginning to end for your Jobber notification service, including the GitHub Packages dependency, npm authentication, Docker secret, Compose configuration, build, and startup.

1. Project structure

You should have roughly:

E:\jobberapp
│
├── docker-compose.yaml
│
└── server
└── 2-notification-service
├── Dockerfile.dev
├── package.json
├── tsconfig.json
├── .npmrc
├── .npmrc.docker
├── src
└── tools
└── copyAssets.ts

Your notification service depends on:

@mayank30041995/jobber-shared@0.0.12

That package is hosted on GitHub Packages, not the public npm registry.

2. GitHub Package configuration

The package scope is:

@mayank30041995

and its registry is:

https://npm.pkg.github.com

Therefore the npm configuration needs:

@mayank30041995:registry=https://npm.pkg.github.com

and an authentication token.

3. Create a GitHub token

Create a GitHub Personal Access Token that has permission to read GitHub Packages.

For a classic PAT, make sure it has:

read:packages

If the repository/package is private, the token also needs appropriate access to the repository/package.

4. Set the token in PowerShell

From:

E:\jobberapp\server\2-notification-service

set:

$env:GITHUB_TOKEN="YOUR_GITHUB_TOKEN"

Check that it exists without displaying it:

if ($env:GITHUB_TOKEN) {
Write-Host "GITHUB_TOKEN is set"
} else {
Write-Host "GITHUB_TOKEN is NOT set"
} 5. Create .npmrc

Your service's:

E:\jobberapp\server\2-notification-service\.npmrc

should contain:

@mayank30041995:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

You can create it with:

@"
@mayank30041995:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=$env:GITHUB_TOKEN
"@ | Set-Content .npmrc

Check only the first line if you don't want to display the token:

Get-Content .npmrc | Select-Object -First 1

Expected:

@mayank30041995:registry=https://npm.pkg.github.com 6. Test GitHub Packages locally

This is a very important step.

Run:

npm view @mayank30041995/jobber-shared@0.0.12

You should get package information similar to:

@mayank30041995/jobber-shared@0.0.12
Helpers library for Jobber app

dist-tags:
latest: 0.0.12

If this works, npm can authenticate to GitHub Packages.

If you get:

401 Unauthorized

fix GitHub authentication before doing anything with Docker.

If you get:

404 Not Found

check the registry configuration.

7. Create a Docker-specific npmrc

For Docker, create:

E:\jobberapp\server\2-notification-service\.npmrc.docker

Copy the working .npmrc:

Copy-Item .npmrc .npmrc.docker -Force

Check:

Get-Content .npmrc.docker | Select-Object -First 1

Expected:

@mayank30041995:registry=https://npm.pkg.github.com

The second line should contain the actual authentication token.

8. Never commit the token

Add this to:

E:\jobberapp\.gitignore
server/2-notification-service/.npmrc
server/2-notification-service/.npmrc.docker

This is extremely important.

9. Dockerfile.dev

Your final Dockerfile.dev should be:

FROM node:21-alpine3.18

WORKDIR /app

COPY package.json ./
COPY tsconfig.json ./
COPY src ./src
COPY tools ./tools

RUN ls -a

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
npm install && npm install -g nodemon

EXPOSE 4001

CMD ["npm", "run", "dev"]

The important part is:

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
npm install && npm install -g nodemon

This allows npm to authenticate during the image build without permanently copying the npm credentials into the image layers.

10. Docker Compose

Your notification service should look like:

notifications:
container_name: notification_container
build:
context: ./server/2-notification-service
dockerfile: Dockerfile.dev
secrets: - npmrc
restart: always
ports: - "4001:4001"
env_file: - ./server/2-notification-service/.env
environment: - ENABLE_APM=1 - NODE_ENV=development - CLIENT_URL=http://localhost:3000 - RABBITMQ_ENDPOINT=amqp://jobber:jobberpass@rabbitmq_container:5672 - SENDER_EMAIL=lysanne.rutherford88@ethereal.email - SENDER_EMAIL_PASSWORD=ad8y45AkfebKmW8rCV - ELASTIC_SEARCH_URL=http://elastic:admin1234@elasticsearch_container:9200 - ELASTIC_APM_SERVER_URL=http://apm_server_container:8200 - ELASTIC_APM_SECRET_TOKEN=
depends_on: - elasticsearch - rabbitmq

Notice this:

secrets:

- npmrc

under the build section.

Then at the bottom of docker-compose.yaml:

secrets:
npmrc:
file: ./server/2-notification-service/.npmrc.docker

So the relevant complete part is:

services:
notifications:
container_name: notification_container
build:
context: ./server/2-notification-service
dockerfile: Dockerfile.dev
secrets: - npmrc

    restart: always

    ports:
      - "4001:4001"

    env_file:
      - ./server/2-notification-service/.env

    environment:
      - ENABLE_APM=1
      - NODE_ENV=development
      - CLIENT_URL=http://localhost:3000
      - RABBITMQ_ENDPOINT=amqp://jobber:jobberpass@rabbitmq_container:5672
      - SENDER_EMAIL=lysanne.rutherford88@ethereal.email
      - SENDER_EMAIL_PASSWORD=ad8y45AkfebKmW8rCV
      - ELASTIC_SEARCH_URL=http://elastic:admin1234@elasticsearch_container:9200
      - ELASTIC_APM_SERVER_URL=http://apm_server_container:8200
      - ELASTIC_APM_SECRET_TOKEN=

    depends_on:
      - elasticsearch
      - rabbitmq

secrets:
npmrc:
file: ./server/2-notification-service/.npmrc.docker 11. Validate Compose

From:

E:\jobberapp

run:

docker compose config

You should not get an error.

You can also check specifically that Compose sees the build configuration:

docker compose config | findstr /i "npmrc notifications" 12. Build the notification image

From:

E:\jobberapp

run:

docker compose build --no-cache notifications

You want to see something like:

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc npm install

and eventually:

Successfully built

or:

Image jobberapp-notifications Built

The previous:

401 Unauthorized

should now be gone.

13. Start the notification service

Once the build succeeds:

docker compose up -d notifications

Check:

docker compose ps

You should see:

notification_container

running.

14. Check notification logs

Run:

docker compose logs -f notifications

Or:

docker logs -f notification_container

You want to see your Node application starting rather than an npm authentication error.

15. Start all infrastructure

Once notification works, you can start the supporting services:

docker compose up -d redis mongodb mysql postgres rabbitmq elasticsearch kibana

Then:

docker compose up -d notifications

Or simply:

docker compose up -d 16. Check everything

Run:

docker compose ps

You should eventually have:

redis
mongodb
mysql
postgres
rabbitmq
elasticsearch
kibana
notifications

running.

17. Notification service flow

Your final architecture is essentially:

                 ┌───────────────────┐
                 │    RabbitMQ       │
                 │ rabbitmq_container │
                 └─────────┬─────────┘
                           │
                           │ AMQP
                           ▼
                 ┌────────────────────┐
                 │   Notifications   │
                 │ notification_      │
                 │ container          │
                 │                    │
                 │ Node.js + TS       │
                 │ Express            │
                 │ Email Consumer     │
                 └─────────┬──────────┘
                           │
                           ▼
                    Nodemailer
                           │
                           ▼
                       Email

And during Docker build:

Docker
│
├── package.json
│
├── npm install
│ │
│ └── @mayank30041995/jobber-shared
│ │
│ ▼
│ GitHub Packages
│ npm.pkg.github.com
│
└── npmrc secret 18. Your complete troubleshooting sequence

If it breaks again, don't randomly change Docker files. Run these in order.

A. Does GitHub package authentication work?
npm view @mayank30041995/jobber-shared@0.0.12
B. Is npm using GitHub Packages?
npm config get @mayank30041995:registry

Expected:

https://npm.pkg.github.com/
C. Does Compose understand the secret?
docker compose config
D. Rebuild cleanly
docker compose build --no-cache notifications
E. Start
docker compose up -d notifications
F. Logs
docker compose logs -f notifications
One cleanup I'd also recommend

Your Compose file currently has:

version: "3.9"

Docker is already warning:

the attribute `version` is obsolete

With modern Docker Compose, remove that line.

So start your Compose file with:

services:
redis:
...

rather than:

version: "3.9"

services:
redis:
...

The warning isn't causing your package problem, but removing it cleans up the configuration.

The key lesson from your whole troubleshooting session: the package is valid, GitHub Packages is the correct registry, your local npm authentication works, and Docker needs the authenticated .npmrc supplied as a BuildKit secret. Once docker-compose.yaml attaches that secret under notifications.build.secrets, npm install can fetch @mayank30041995/jobber-shared@0.0.12 during the image build.
