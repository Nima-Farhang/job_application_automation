FROM mcr.microsoft.com/devcontainers/typescript-node:1-22-bookworm

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y --no-install-recommends \
    bash \
    curl \
    ca-certificates \
    file \
    jq \
    git \
    && update-ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /workspaces
