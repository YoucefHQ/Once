FROM node:14.15-alpine3.11

ENV INSTALL_PATH /opt/app
RUN mkdir -p $INSTALL_PATH
WORKDIR $INSTALL_PATH

COPY package.json .
RUN yarn install

COPY . /opt/app
CMD [ "yarn", "start" ]