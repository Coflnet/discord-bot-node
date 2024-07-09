FROM registry.suse.com/bci/nodejs:20 as base

COPY package*.json .

RUN npm ci

COPY . .

CMD npm run update-commands && npm run start
