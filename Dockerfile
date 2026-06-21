FROM node:22-alpine AS build

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm ci

COPY public ./public
COPY src ./src
COPY postcss.config.js tailwind.config.js ./
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL
RUN npm run build

RUN chown -R node:node /usr/src/app

USER node

EXPOSE 3000

CMD ["npm", "start"]
