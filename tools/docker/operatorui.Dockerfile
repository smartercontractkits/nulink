# Build NuLink
FROM smartcontract/builder:1.0.25

ARG SRCROOT=/usr/local/src/nulink
WORKDIR ${SRCROOT}
