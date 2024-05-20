---
title: Authenticate to the GitHub Container Registry
date: 2024-05-18
tags:
  - github
---
To authenticate to the [Github Container Registry](../Topics/Github%20Container%20Registry.md), follow these steps:

1. **Generate a Personal Access Token:** Navigate to the [New personal access token (classic)](https://github.com/settings/tokens/new?scopes=write:packages,delete:packages) page on GitHub and create a new token with the `write:packages` and `delete:packages` scopes.
2. **Configure Your Environment:** Save your personal access token and GitHub username as environment variables:
     ```
     export GITHUB_TOKEN=<YOUR_TOKEN>
     export GITHUB_USERNAME=<YOUR_TOKEN>
     ```
3. **Log in to the Container Registry:** Use the Docker CLI to log in to the GitHub Container Registry by piping your GitHub token as the password: 
     ```
     echo $GITHUB_TOKEN | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
     ```