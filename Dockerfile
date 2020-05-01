FROM node:10
WORKDIR /app
COPY package.json /app
RUN npm install
RUN npm install @slack/bolt
COPY . /app
EXPOSE 3000
CMD node index.js