FROM node:10.15.3 AS builder
RUN mkdir /app
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn install --frozen-lockfile
COPY . /app
RUN yarn build

FROM node:10.15.3

RUN mkdir /app
WORKDIR /app
COPY package.json /app
COPY yarn.lock /app
RUN yarn install --production --frozen-lockfile
COPY . /app
COPY --from=builder /app/dist /app/dist
EXPOSE 3000
CMD yarn start
