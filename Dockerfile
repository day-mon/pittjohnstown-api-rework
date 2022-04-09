## Docker file for node js with typscript

FROM node:16

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm i

COPY . .
EXPOSE 6060

CMD ['npm', 'run', 'production']
