FROM node:22-alpine
WORKDIR /app

COPY package.json package-lock.json ./

RUN npm install --legacy-peer-deps

COPY public ./public
COPY src ./src

CMD ["npm", "start"]