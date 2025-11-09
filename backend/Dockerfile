FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env .env
RUN npm install

COPY . .
RUN npm run build
RUN mkdir -p dist/emails && cp -r src/emails/* dist/emails/

FROM node:20-alpine

WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
COPY .env .env
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["npm", "start"]
