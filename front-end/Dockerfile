FROM node:23-alpine3.19
WORKDIR /
COPY *.html ./
COPY *.css ./
COPY package*.json ./
RUN npm install --only-production
EXPOSE 8000
COPY . .

CMD npm start