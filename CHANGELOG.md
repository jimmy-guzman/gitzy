# [1.4.0](https://github.com/jimmy-guzman/gitzy/compare/v1.3.3...v1.4.0) (2021-05-06)


### Features

* **cli:** ✨ add ability to `--retry` previous commit ([4d902a0](https://github.com/jimmy-guzman/gitzy/commit/4d902a03424e705c0e038ab51ce1eb17a059d84d)), closes [#7](https://github.com/jimmy-guzman/gitzy/issues/7)

## [1.3.3](https://github.com/jimmy-guzman/gitzy/compare/v1.3.2...v1.3.3) (2021-02-20)


### Bug Fixes

* **cli:** 🐛 account for space in final message for max length ([5df05ac](https://github.com/jimmy-guzman/gitzy/commit/5df05ac0d2d88409c1de946d254c6ff4a9b86b26)), closes [#53](https://github.com/jimmy-guzman/gitzy/issues/53)
* **cli:** 🐛 do not execute git commit during dry run ([25dd6b0](https://github.com/jimmy-guzman/gitzy/commit/25dd6b05e6510362e2770631150cd964f8348c1b))

## [1.3.2](https://github.com/jimmy-guzman/gitzy/compare/v1.3.1...v1.3.2) (2021-02-04)


### Bug Fixes

* **cli:** 🐛 limit scope's choices view to 10 ([aae8763](https://github.com/jimmy-guzman/gitzy/commit/aae8763014a7cdcb3b40ff382c2dca4dbb73aa05))
* **cli:** 🐛 use correct emoji(✨) for `feat` type ([190b04c](https://github.com/jimmy-guzman/gitzy/commit/190b04c4dab7fbf0af1b8002b3a356e57622223e))
* **cli:** 🐛 use correct emoji(💥) for breaking change ([dbfb7a5](https://github.com/jimmy-guzman/gitzy/commit/dbfb7a561dc7ab3901b48c6a5da00583a640e26a))

## [1.3.1](https://github.com/jimmy-guzman/gitzy/compare/v1.3.0...v1.3.1) (2021-01-24)


### Bug Fixes

* **cli:** 🐛 merge user & commitlint configs when `--commitlint` ([0a3685c](https://github.com/jimmy-guzman/gitzy/commit/0a3685c7c32eb03079124a4760f4152977067ded))

# [1.3.0](https://github.com/jimmy-guzman/gitzy/compare/v1.2.1...v1.3.0) (2021-01-23)


### Features

* 🎸 add `--skip` flag to support skipping questions ([6974275](https://github.com/jimmy-guzman/gitzy/commit/69742753d44b680d1d4c91b2b6ceb116de13cce6)), closes [#10](https://github.com/jimmy-guzman/gitzy/issues/10)
* 🎸 support `.config/*` as a configuration path ([d00dfb3](https://github.com/jimmy-guzman/gitzy/commit/d00dfb31d878cf381b47a817e28903b8b1ced3dc))

## [1.2.1](https://github.com/jimmy-guzman/gitzy/compare/v1.2.0...v1.2.1) (2021-01-22)


### Bug Fixes

* **cli:** 🐛 remove extra characters during dry run ([0e671ec](https://github.com/jimmy-guzman/gitzy/commit/0e671ec41eb3e4b5f0f0dbada4718bef8e99a6a0))

# [1.2.0](https://github.com/jimmy-guzman/gitzy/compare/v1.1.1...v1.2.0) (2021-01-21)


### Bug Fixes

* **cli:** 🐛 `--subject` is now respected ([004eaf3](https://github.com/jimmy-guzman/gitzy/commit/004eaf320e3f93c3b72ae12b94c7c5c3ae554fbf))
* **cli:** 🐛 remove extra padding during dry run ([9e24c88](https://github.com/jimmy-guzman/gitzy/commit/9e24c8840f32aa680da8fd443b6187c02dffa9c3))


### Features

* **cli:** 🎸 checks if current directory is a git repo ([d8aa0b1](https://github.com/jimmy-guzman/gitzy/commit/d8aa0b18b6f6d121afe0e3efd08b7da9a8cd777f))

## [1.1.1](https://github.com/jimmy-guzman/gitzy/compare/v1.1.0...v1.1.1) (2021-01-19)


### Bug Fixes

* **cli:** 🐛 `--commitlint` should still work if no gitzy config ([5e16015](https://github.com/jimmy-guzman/gitzy/commit/5e16015cb259f7e67eaea4bf9565bc48cacc3073))
* **cli:** 🐛 if no "scopes" in any config, skip scopes prompt ([dee68e5](https://github.com/jimmy-guzman/gitzy/commit/dee68e5783fa8de65d60f233b3cb53190a047c49))

# [1.1.0](https://github.com/jimmy-guzman/gitzy/compare/v1.0.0...v1.1.0) (2021-01-19)


### Bug Fixes

* **cli:** 🐛 prevent cancellation due to empty "scopes" ([3daebe8](https://github.com/jimmy-guzman/gitzy/commit/3daebe8f82dd0141d0156e847a4abf1889f6e0a8))
* **cli:** 🐛 standardize inconsistent logging ([3e6c8b9](https://github.com/jimmy-guzman/gitzy/commit/3e6c8b9fcf45500fab3b4992a7c75d2bca2fa5c5))


### Features

* **cli:** 🎸 add `--no-emoji` flag to disable emojis ([e2d82c9](https://github.com/jimmy-guzman/gitzy/commit/e2d82c97c8a4cf2ec54476e41e7d2e31c6377664))
* **cli:** 🎸 add `--commitlint` flag to leverage commitlint config ([ef3df94](https://github.com/jimmy-guzman/gitzy/commit/ef3df942b98fb279079ad60c7754214663c4d6bc))

# 1.0.0 (2021-01-18)


### Features

* **cli:** 🎸 initial release ([9fc96a5](https://github.com/jimmy-guzman/gitzy/commit/9fc96a524991f730db403b569a954ce64a2c7579))
