FROM node:10.16.3-alpine

ARG SRCROOT=/usr/local/src/nulink
WORKDIR ${SRCROOT}
COPY yarn.lock package.json tsconfig.cjs.json ./
COPY tools/cypress-job-server/package.json tools/cypress-job-server/

# install deps for our integration scripts
RUN yarn

# copy over all our dependencies
COPY tools/cypress-job-server tools/cypress-job-server

# setup project
RUN yarn workspace @nulink/cypress-job-server setup

ENV JOB_SERVER_PORT 6692
EXPOSE 6692

ENTRYPOINT ["yarn", "workspace", "@nulink/cypress-job-server", "start"]
