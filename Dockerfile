FROM node:16
WORKDIR /app
EXPOSE 80
COPY package.json .
RUN npm i
COPY . .
CMD ["npm", "run", "start"]
