<!--suppress HtmlDeprecatedAttribute -->
<h1 align="center">
  <br>
  <a href="https://www.sphereon.com"><img src="https://sphereon.com/content/themes/sphereon/assets/img/logo.svg" alt="Sphereon" width="400"></a>
  <br>Gaia-X Agent 
  <br>
</h1>

---

__Warning: These packages still is in a very early development stage. Breaking changes without notice will happen at this
point!__

---

# Gaia-X agent

This is mono repository, with packages that handles steps for creating gaia-x compliant entites with [Veramo](https://veramo.io) modules.

This mono repo has thwe following packages:
- compliance-client
    - a client for connecting to gaia-x's compliance service
      TODO: add addtional packages

## Building and testing

### Lerna

This package makes use of Lerna for managing multiple packages. Lerna is a tool that optimizes the workflow around managing multi-package repositories with git and npm / yarn.

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
