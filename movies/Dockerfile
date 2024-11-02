FROM node:23-alpine3.19
WORKDIR /
COPY package*.json ./
RUN npm install --only-production
EXPOSE 3000
COPY . .

CMD npm start