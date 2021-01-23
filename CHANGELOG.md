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
