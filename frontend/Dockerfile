FROM node:21-alpine

WORKDIR /app


COPY ./frontend/package*.json ./frontend/
COPY ./types ./types/
RUN cd frontend && npm install

COPY ./frontend  ./frontend/
RUN cd frontend && npm run build




