FROM node:21-alpine AS builder

WORKDIR /app
# COPY package.json to docker environment
COPY backend ./backend
RUN cd backend && npm install
# COPY source files
COPY types ./types
# RUN Build process
RUN cd backend && npm run build

FROM node:21-alpine AS runtime

WORKDIR /app

COPY --from=builder /app/backend/dist ./dist
COPY backend/package*.json ./

RUN npm install --omit=dev

EXPOSE 8080

CMD ["node", "./dist/backend/server.js"]