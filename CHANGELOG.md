# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [0.3.0](https://github.com/Sphereon/gx-agent/compare/v0.2.1...v0.3.0) (2023-02-16)


### Bug Fixes

* changed [@id](https://github.com/id) to id in the default fixtures ([082212f](https://github.com/Sphereon/gx-agent/commit/082212f4f60928412372b822f37d36fc1eb3cfd1))
* changed the addres of dbfile ([d9ff4de](https://github.com/Sphereon/gx-agent/commit/d9ff4deb46f30f05df00dbec4f576ea4477c74cb))
* changed the path for our new version of the gx-compliance api ([f9a7172](https://github.com/Sphereon/gx-agent/commit/f9a71721d56759853b56d65bb598170b709cc507))
* creating the db file in the correct place ([5dd70a6](https://github.com/Sphereon/gx-agent/commit/5dd70a67477c9c2c77cd3f344f00d705d20cff60))
* credential handling domain fixes ([ff644d2](https://github.com/Sphereon/gx-agent/commit/ff644d2e9e320bd867bdb3272681b8998271534c))
* Fix problem with trying to host DIDs that are not the agent's ([a768212](https://github.com/Sphereon/gx-agent/commit/a7682126b541fc2703d0db226586ef65fcc156e6))
* fixed __dirname error ([8708264](https://github.com/Sphereon/gx-agent/commit/870826416535bf891ee62d4a7f78fe55113d9e9b))
* fixed db address in current work directory mode ([f95e2ec](https://github.com/Sphereon/gx-agent/commit/f95e2ec70a1d9405d651370cdd477039ec884dce))
* fixed participant sd example creation ([3d0e8a3](https://github.com/Sphereon/gx-agent/commit/3d0e8a316c3ce6e3d44a188de481e550a8d27726))
* fixed the issue with submitting so file ([f1705ef](https://github.com/Sphereon/gx-agent/commit/f1705ef39e6a6d49fb0f0bfa208279dfcd601474))
* Make sid argument required for SD verification ([b71dfcb](https://github.com/Sphereon/gx-agent/commit/b71dfcb7520b70d5e81e34a8d8a43e1383388150))
* participant validation fixes ([5b97bb8](https://github.com/Sphereon/gx-agent/commit/5b97bb80d91d727397c3f6c5b69a87d1e64fab29))
* some minor changes/fixes in onboarding ecosystem ([76b45f9](https://github.com/Sphereon/gx-agent/commit/76b45f90890e65ebbc76ad80e94a35b82f6f42e3))


### Features

* add export methods for VCs and VPs ([00cde89](https://github.com/Sphereon/gx-agent/commit/00cde8998483861598208bd80dbc9d3f07903f4b))
* added back onboardParticipantWithVerifiablePresentation to onboarding ecosystem ([d3b310f](https://github.com/Sphereon/gx-agent/commit/d3b310fbc007cd3b9f8eb4d8f2ff6e1f244ad124))
* added onboard so on ecosystem method ([67273e9](https://github.com/Sphereon/gx-agent/commit/67273e96d6aa08256562d08908f8d6f6edce9886))
* added onboard so on ecosystem method ([eab419a](https://github.com/Sphereon/gx-agent/commit/eab419ab0e2099ed0c084ed9b3775f8a0bc28354))
* added persist flag to everywhere we're issueing a vp, limited console logs with show flag ([c6ef81e](https://github.com/Sphereon/gx-agent/commit/c6ef81e9f5f207beb837ca9ca0f6f100ff5dbf2a))
* added various kinds of serviceoffering to default fixtures, plus added ability to create UnsignedCredential for both v2206 and v2210 ([551209e](https://github.com/Sphereon/gx-agent/commit/551209e4033bcb7dcdbd2c2bca6a355a318a8e52))
* move to ESM and pnpm ([a4f0ef1](https://github.com/Sphereon/gx-agent/commit/a4f0ef1408a05316f1ea80944fd954d6f3cdfb70))
* move to ESM and pnpm ([5b72a9e](https://github.com/Sphereon/gx-agent/commit/5b72a9e4ee0a246918ed5dc8ac733229f1c96c6d))
* move to ESM and pnpm ([9bdcd5b](https://github.com/Sphereon/gx-agent/commit/9bdcd5bd29053698eacf85b3cb38402d8a36762f))





## [0.2.1](https://github.com/Sphereon/gx-agent/compare/v0.2.0...v0.2.1) (2023-02-15)

**Note:** Version bump only for package gx-agent-workspace





# [0.2.0](https://github.com/Sphereon/gx-agent/compare/v0.1.2...v0.2.0) (2023-01-27)

### Bug Fixes

- fixed issue in vp issue ([acfd0e6](https://github.com/Sphereon/gx-agent/commit/acfd0e6b88c51574ba1f216de3c408e36f24db78))
- readme updated ([ce399ff](https://github.com/Sphereon/gx-agent/commit/ce399ffbb3fdb5f4a84fa3e353f252026950b927))
- removed the dependency to js-yaml ([41c4f67](https://github.com/Sphereon/gx-agent/commit/41c4f676397bdfda885468340e8f19bd4f43d83f))

### Features

- add ecosystem config support ([b90b410](https://github.com/Sphereon/gx-agent/commit/b90b410b6dc5d410e5bbe44def03cd937e72aba6))
- add ecosystem documentation ([00d5292](https://github.com/Sphereon/gx-agent/commit/00d52921457d637befc69f54bcd50aa96e78f7a7))
- added onboarding functionality for ecosystem ([7dd0fa9](https://github.com/Sphereon/gx-agent/commit/7dd0fa9ab3ce969684d3b351bd9d7ebf96e766df))
- changed the agent config to create the db near the agent.yml ([6186b33](https://github.com/Sphereon/gx-agent/commit/6186b339b6fc951db0d738758e7207ecff88a586))

## [0.1.2](https://github.com/Sphereon/gx-agent/compare/v0.1.1...v0.1.2) (2023-01-26)

### Bug Fixes

- Disable integration test, because compliance service has moved without any notice ([c6f8d8b](https://github.com/Sphereon/gx-agent/commit/c6f8d8ba091746afd1cdb45d277572cdd3b7b1d0))

## 0.1.1 (2023-01-23)

### Bug Fixes

- moved dependency from dev to normal ([5b6a40d](https://github.com/Sphereon/gx-agent/commit/5b6a40d8a927ac140007b6345b1c47a3dbb30f46))
- moved dependency from dev to normal ([eb523c4](https://github.com/Sphereon/gx-agent/commit/eb523c45ee66f0cbe9b64a6c595ca061a55c4fc4))
