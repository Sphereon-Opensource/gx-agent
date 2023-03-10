<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="400"></a>
  <br>Gaia-X Agent 
  <br>
</h1>

---

__These packages are in a very early development stage. Breaking changes without notice will occur at this
point!__

**WARNING: This Gaia-X agent is compatible only with a non-official Gaia-X compliance service with Verifiable
Presentation support**
---

# Gaia-X agent

The Gaia-X agent is an agent that can create Verifiable Credentials and Presentations out of Gaia-X self-descriptions.
It can submit these to the Gaia-X Compliance Server, to get back Compliance Credentials. The agent can also issue and
verify generic Verifiable Credentials and Presentations.
Lastly the agent can export well-known resources, like DID:web and X.509 Certificate chains needed in a Gaia-X context.

# Multiple scenario's

The Agent can be deployed and used in multiple scenarios:

- As a [Command Line tool (CLI)](packages/gx-agent-cli/README.md)
- As a REST API
- Directly integrated into a typescript and/or React-Native project

![Overview](./fixtures/overview.png)

If you quickly want to test out the agent features, we suggest the [CLI](packages/gx-agent-cli/README.md)

# Prerequisites

## Create X.509 keys and get SSL certificate

You will first need to have an existing X.509 EV SSL certificate or create a new
one. [This document](./docs/X509-setup.md)
explains how to setup a new X.509 certificate. Without following the steps in the document you cannot be onboarded as
Gaia-X participant.

## Setting up the agent

For now the [CLI](packages/gx-agent-cli/README.md) is the only documented way to setup the agent. In the future the
other scenario's will be described as well.

## Onboarding documentation and CLI documentation

The [CLI Documentatation](./packages/gx-agent-cli/README.md) explains all the commands available in the CLI. However if
you would like to follow a more structured process on how you can onboard using the Agent/CLI, you can also
read [this PDF](./docs/Gaia-X%20and%20FMA%20-%20Onboarding%20Process.pdf) document, which has additional information,
and takes you through the process in consecutive order.

# Developers

This is mono repository, with packages that handle steps for creating Gaia-X compliant Entities like self-descriptions
compatible with [Veramo](https://veramo.io) modules.

This mono repo has the following packages:

- [gx-agent](./packages/gx-agent)
    - an agent managing GX credentials, presentations and compliance service
- [gx-agent-cli](./packages/gx-agent-cli)
    - CLI support for the agent

## Building and testing

### Lerna

This package makes use of Lerna for managing multiple packages. Lerna is a tool that optimizes the workflow around
managing multi-package repositories with git and npm / yarn.

### Build

The below command builds all packages for you using lerna

```shell
yarn build
```

### Test

The test command runs:

* `jest`
* `coverage`

You can also run only a single section of these tests, using for example `yarn test:watch`.

```shell
yarn test
```

### Utility scripts

There are other utility scripts that help with development.

* `yarn prettier` - runs `prettier` to fix code style.

### Publish

There are scripts that can publish the following versions:

* `latest`
* `next`
* `unstable`

```shell
yarn publish:[version]
```
