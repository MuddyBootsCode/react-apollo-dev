FROM node:12

RUN mkdir -p /app
WORKDIR /app

COPY package.json .
RUN yarn install
COPY . .

EXPOSE 3000

CMD ["yarn", "start"]