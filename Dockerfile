FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY public ./public
COPY src ./src
COPY postcss.config.js tailwind.config.js ./

RUN chown -R node:node /usr/src/app

USER node

EXPOSE 3000

CMD ["npm", "start"]
