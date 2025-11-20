FROM node:21-alpine

WORKDIR /app/frontend

COPY ./frontend/package*.json ./
COPY ./types ../types/
RUN npm install

COPY ./frontend  ./
RUN npm run build




