FROM node:20

WORKDIR /app

COPY package.json .

RUN npm config set fetch-timeout 600000
RUN npm config set fetch-retries 5

RUN npm install

COPY . .

EXPOSE 1234

CMD [ "npm", "start" ]