# syntax=docker/dockerfile:1.7

FROM node:21-alpine3.18 AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY src ./src
COPY tools ./tools

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci && npm run build


FROM node:21-alpine3.18 AS production

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
COPY tsconfig.json ./

RUN npm install -g pm2

RUN --mount=type=secret,id=npmrc,target=/root/.npmrc \
    npm ci --omit=dev

COPY --from=builder /app/build ./build

EXPOSE 4007

CMD ["npm", "run", "start"]