FROM node:23-alpine3.19
WORKDIR /
COPY package*.json ./
RUN npm install
COPY . .

CMD npm start