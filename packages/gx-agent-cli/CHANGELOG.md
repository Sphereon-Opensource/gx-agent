# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [0.10.2](https://github.com/Sphereon/gx-agent/compare/v0.10.1...v0.10.2) (2023-09-18)


### Bug Fixes

* did:web sometimes ended up as https:// subject in a VC ([b5dfcbb](https://github.com/Sphereon/gx-agent/commit/b5dfcbbfc3d8888bab36d885a6b8f443548ad862))





## [0.10.1](https://github.com/Sphereon/gx-agent/compare/v0.10.0...v0.10.1) (2023-07-11)

### Bug Fixes

- wrong property being passed ([c08943d](https://github.com/Sphereon/gx-agent/commit/c08943deec68f10551d057ed97b527b04ae64122))

# [0.10.0](https://github.com/Sphereon/gx-agent/compare/v0.9.4...v0.10.0) (2023-07-10)

### Bug Fixes

- minor bug fix plus doc update and prettier ([a27528d](https://github.com/Sphereon/gx-agent/commit/a27528dfb0a8838655fc4c90a0526b8375db8bff))
- participant sd export fixed ([bd49789](https://github.com/Sphereon/gx-agent/commit/bd497894cd640de0e8155a400bc8a680bbaffb86))
- printing vp id when issuing (& persisting) a vp ([76a5d92](https://github.com/Sphereon/gx-agent/commit/76a5d9296f022ff78d549b36dca6a9c407b78410))
- removed nonsense console log ([fb3c548](https://github.com/Sphereon/gx-agent/commit/fb3c548643094382746d1a07436e7adcc540cae4))

### Features

- added participant example for v1.2.8 plus some readme plus fixed calling v2210 as well as v1.2.8 ([62b4244](https://github.com/Sphereon/gx-agent/commit/62b4244b04844f116d5662da2f302392d082bcef))
- added support for verifying a SO or Participant VC to the ecosystem cli and removed external verification from so and participant cli ([a20d1ea](https://github.com/Sphereon/gx-agent/commit/a20d1ea05c707c2369fedb25efb2836317a47602))
- fixed agent for connecting to CS v1.2.8 ([a49cc05](https://github.com/Sphereon/gx-agent/commit/a49cc054415e43a9f14a245b3425387e8f38930d))
- Move to PS256 ([a9f45c1](https://github.com/Sphereon/gx-agent/commit/a9f45c1e79f9d9630b524c1ae3d1f5de8643b8dd))
- removed support for v2210 and v2204 and update readmes ([57aeb7d](https://github.com/Sphereon/gx-agent/commit/57aeb7d209e81cf6c90652860306e0f9d94edd3c))
- update to latest SDK versions ([145087f](https://github.com/Sphereon/gx-agent/commit/145087f53b3ae8b762917cdd142fb2a6a3ebab47))

## [0.9.4](https://github.com/Sphereon/gx-agent/compare/v0.9.3...v0.9.4) (2023-05-24)

**Note:** Version bump only for package @sphereon/gx-agent-cli

## [0.9.3](https://github.com/Sphereon/gx-agent/compare/v0.9.1...v0.9.3) (2023-05-24)

**Note:** Version bump only for package @sphereon/gx-agent-cli

## [0.9.1](https://github.com/Sphereon/gx-agent/compare/v0.8.0...v0.9.1) (2023-05-24)

### Bug Fixes

- Make sure we are not getting did-jwt 7.x as that moved to ESM and has an issue with uint8arrays ([3fcbb3d](https://github.com/Sphereon/gx-agent/commit/3fcbb3dde133d4e215b941e1d511fdbec731754f))

# [0.8.0](https://github.com/Sphereon/gx-agent/compare/v0.7.0...v0.8.0) (2023-05-23)

### Features

- removed the challenge from VP creation, plus updated the dependencies ([5f68908](https://github.com/Sphereon/gx-agent/commit/5f68908974d2d99282ffa2a05f564185e9003719))

# [0.7.0](https://github.com/Sphereon/gx-agent/compare/v0.6.0...v0.7.0) (2023-03-10)

### Bug Fixes

- fixed the issue with compliance credentials from ecosystem and so not saving for ecosystems ([77ee419](https://github.com/Sphereon/gx-agent/commit/77ee4197247c478a6054aa80640f119900b07add))
- getting type of VC is inline with our general approach ([e2097b9](https://github.com/Sphereon/gx-agent/commit/e2097b975a73a0b537cd390164b44437197f3199))
- made command so sd list also return the dcat service types ([9e07f47](https://github.com/Sphereon/gx-agent/commit/9e07f47b14b7fb32265266197005b5f3bba64fc6))

### Features

- added vp extraction functionality ([d7f8a95](https://github.com/Sphereon/gx-agent/commit/d7f8a95a78b9d7fbca12c1f21f3667162b5980e4))
- reverted the persist optionality, now we're saving the vps for participant submit command ([2b5c270](https://github.com/Sphereon/gx-agent/commit/2b5c270b78235ef6706fb0969f166a1bf1656b0a))
- vc list now can filter base on type and issuer ([04668f2](https://github.com/Sphereon/gx-agent/commit/04668f2c9cd57f1c6b051ca9f994ca438436e500))

# [0.6.0](https://github.com/Sphereon/gx-agent/compare/v0.5.0...v0.6.0) (2023-03-07)

### Bug Fixes

- changed the bug in for ([a87e8f9](https://github.com/Sphereon/gx-agent/commit/a87e8f9d3095f0f8408e07bfc2aa4dda30ce85ae))
- Move remove shorthand from --show command, as it might interfere in PS with other commands starting with a 's''! ([1318c70](https://github.com/Sphereon/gx-agent/commit/1318c70da3b2bcf211ff516176c9fa47865b9d62))
- some bug fixes in the ecosystem flow, plus changed the shpe from gx registry to sphereon's registry ([0baf8fb](https://github.com/Sphereon/gx-agent/commit/0baf8fbff6d1de89b97e6b40f0da575cf7e121de))

### Features

- added label to ecosystem so onboarding ([27308ee](https://github.com/Sphereon/gx-agent/commit/27308ee6d51241aac71bdca829db0cd8a3b88fa8))
- updated readme and fixtures to support all listed gx types ([ce366c6](https://github.com/Sphereon/gx-agent/commit/ce366c66fdd5d80f94835d169c63ead2519238f4))

# [0.5.0](https://github.com/Sphereon/gx-agent/compare/v0.4.4...v0.5.0) (2023-03-05)

### Features

- Add label VCs to submit method ([3a54f22](https://github.com/Sphereon/gx-agent/commit/3a54f2256e265a957f0be94b8ce7b60718cf3f60))

## [0.4.4](https://github.com/Sphereon/gx-agent/compare/v0.4.3...v0.4.4) (2023-03-05)

### Bug Fixes

- changed the readme section about submitting SOs ([38bbc1a](https://github.com/Sphereon/gx-agent/commit/38bbc1a22500e417daa2b3e5290ce1c176214012))
- fix dependencies ([fe0af2f](https://github.com/Sphereon/gx-agent/commit/fe0af2fd3c5cf1bd843e22c10546dc4265571dc0))

## [0.4.3](https://github.com/Sphereon/gx-agent/compare/v0.4.2...v0.4.3) (2023-03-02)

### Bug Fixes

- fix dependencies ([6cf211a](https://github.com/Sphereon/gx-agent/commit/6cf211a316c3f8ab046e8467c388cd41fa3a12e7))
- fix dependencies ([fed2688](https://github.com/Sphereon/gx-agent/commit/fed26881fb45638a6f27da33449fea4c122974e6))
- fix dependencies ([73b62c2](https://github.com/Sphereon/gx-agent/commit/73b62c2ef31e7f29c265e0ae0b7caf35ad4bb7e2))

## [0.4.2](https://github.com/Sphereon/gx-agent/compare/v0.4.1...v0.4.2) (2023-03-02)

### Bug Fixes

- fix dependencies ([828c0f8](https://github.com/Sphereon/gx-agent/commit/828c0f8f6d456765e0d6a4c0cf54033a52f823ba))
- fix dependencies ([d7d44d3](https://github.com/Sphereon/gx-agent/commit/d7d44d35673c3359fd118aaee70d14c2bf12ac51))

## [0.4.1](https://github.com/Sphereon/gx-agent/compare/v0.4.0...v0.4.1) (2023-03-02)

### Bug Fixes

- fix dependencies ([6a1c1d0](https://github.com/Sphereon/gx-agent/commit/6a1c1d0880e39c7279dd5c0206e0df5345eff0a3))

# [0.4.0](https://github.com/Sphereon/gx-agent/compare/v0.3.0...v0.4.0) (2023-03-02)

### Features

- add support for SD wizard. Misc fixes ([17cf429](https://github.com/Sphereon/gx-agent/commit/17cf429bb2afff11b45b2a0249695fd735280c80))

# [0.3.0](https://github.com/Sphereon/gx-agent/compare/v0.2.1...v0.3.0) (2023-02-16)

### Bug Fixes

- credential handling domain fixes ([ff644d2](https://github.com/Sphereon/gx-agent/commit/ff644d2e9e320bd867bdb3272681b8998271534c))
- Fix problem with trying to host DIDs that are not the agent's ([a768212](https://github.com/Sphereon/gx-agent/commit/a7682126b541fc2703d0db226586ef65fcc156e6))
- fixed participant sd example creation ([3d0e8a3](https://github.com/Sphereon/gx-agent/commit/3d0e8a316c3ce6e3d44a188de481e550a8d27726))
- fixed the issue with submitting so file ([f1705ef](https://github.com/Sphereon/gx-agent/commit/f1705ef39e6a6d49fb0f0bfa208279dfcd601474))
- Make sid argument required for SD verification ([b71dfcb](https://github.com/Sphereon/gx-agent/commit/b71dfcb7520b70d5e81e34a8d8a43e1383388150))
- participant validation fixes ([5b97bb8](https://github.com/Sphereon/gx-agent/commit/5b97bb80d91d727397c3f6c5b69a87d1e64fab29))
- some minor changes/fixes in onboarding ecosystem ([76b45f9](https://github.com/Sphereon/gx-agent/commit/76b45f90890e65ebbc76ad80e94a35b82f6f42e3))

### Features

- add export methods for VCs and VPs ([00cde89](https://github.com/Sphereon/gx-agent/commit/00cde8998483861598208bd80dbc9d3f07903f4b))
- added onboard so on ecosystem method ([67273e9](https://github.com/Sphereon/gx-agent/commit/67273e96d6aa08256562d08908f8d6f6edce9886))
- added onboard so on ecosystem method ([eab419a](https://github.com/Sphereon/gx-agent/commit/eab419ab0e2099ed0c084ed9b3775f8a0bc28354))
- added persist flag to everywhere we're issueing a vp, limited console logs with show flag ([c6ef81e](https://github.com/Sphereon/gx-agent/commit/c6ef81e9f5f207beb837ca9ca0f6f100ff5dbf2a))
- added various kinds of serviceoffering to default fixtures, plus added ability to create UnsignedCredential for both v2206 and v2210 ([551209e](https://github.com/Sphereon/gx-agent/commit/551209e4033bcb7dcdbd2c2bca6a355a318a8e52))
- move to ESM and pnpm ([9bdcd5b](https://github.com/Sphereon/gx-agent/commit/9bdcd5bd29053698eacf85b3cb38402d8a36762f))

## [0.2.1](https://github.com/Sphereon/gx-agent/compare/v0.2.0...v0.2.1) (2023-02-15)

**Note:** Version bump only for package @sphereon/gx-agent-cli

# [0.2.0](https://github.com/Sphereon/gx-agent/compare/v0.1.2...v0.2.0) (2023-01-27)

### Bug Fixes

- fixed issue in vp issue ([acfd0e6](https://github.com/Sphereon/gx-agent/commit/acfd0e6b88c51574ba1f216de3c408e36f24db78))
- readme updated ([ce399ff](https://github.com/Sphereon/gx-agent/commit/ce399ffbb3fdb5f4a84fa3e353f252026950b927))

### Features

- add ecosystem config support ([b90b410](https://github.com/Sphereon/gx-agent/commit/b90b410b6dc5d410e5bbe44def03cd937e72aba6))
- add ecosystem documentation ([00d5292](https://github.com/Sphereon/gx-agent/commit/00d52921457d637befc69f54bcd50aa96e78f7a7))
- added onboarding functionality for ecosystem ([7dd0fa9](https://github.com/Sphereon/gx-agent/commit/7dd0fa9ab3ce969684d3b351bd9d7ebf96e766df))

## [0.1.2](https://github.com/Sphereon/gx-agent/compare/v0.1.1...v0.1.2) (2023-01-26)

**Note:** Version bump only for package @sphereon/gx-agent-cli

## 0.1.1 (2023-01-23)

**Note:** Version bump only for package @sphereon/gx-agent-cli
