FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY tsconfig.json ./
COPY .npmrc ./
COPY src ./src
COPY tools ./tools

RUN npm ci && npm run build

FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache curl

COPY package*.json ./
COPY tsconfig.json ./
COPY .npmrc ./

RUN npm ci --omit=dev

COPY --from=builder /app/build ./build

EXPOSE 4001

CMD ["npm", "run", "start"]
