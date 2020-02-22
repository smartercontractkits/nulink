FROM node:10.16.3-alpine

ARG SRCROOT=/usr/local/src/nulink
WORKDIR ${SRCROOT}
COPY yarn.lock package.json tsconfig.cjs.json ./
COPY tools/external-adapter/package.json tools/external-adapter/

# install deps for our integration scripts
RUN yarn

# copy over all our dependencies
COPY tools/external-adapter tools/external-adapter

# setup project
RUN yarn workspace @nulink/external-adapter setup

ENV EXTERNAL_ADAPTER_PORT 6644
EXPOSE 6644

ENTRYPOINT [ "yarn", "workspace", "@nulink/external-adapter", "start" ]
