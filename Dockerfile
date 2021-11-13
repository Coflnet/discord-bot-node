FROM node:16-alpine3.11

COPY package*.json .

RUN npm ci

COPY . .

CMD npm run start
