# [5.2.0](https://github.com/jimmy-guzman/gitzy/compare/v5.1.0...v5.2.0) (2024-02-16)


### Bug Fixes

* 🐛 show correct version when running `--version` ([45190cf](https://github.com/jimmy-guzman/gitzy/commit/45190cf84ec1f46d029913d125cff46ef65ee5ed))


### Features

* ✨ reduce package.json noise when publishing ([b09e4b9](https://github.com/jimmy-guzman/gitzy/commit/b09e4b98d95ea5b51a619434ac9f67db6604bb1d))

# [5.1.0](https://github.com/jimmy-guzman/gitzy/compare/v5.0.0...v5.1.0) (2024-02-16)


### Features

* ✨ optimize by moving from Common JS to ES Modules ([bfa53b9](https://github.com/jimmy-guzman/gitzy/commit/bfa53b9192ea7519b901555bec4eadaf715f9a13))

# [5.0.0](https://github.com/jimmy-guzman/gitzy/compare/v4.0.0...v5.0.0) (2024-02-16)


### Features

* ✨ drop support for node v16 ([86f5555](https://github.com/jimmy-guzman/gitzy/commit/86f55556624ff5a3387edc63c2c412e4790f1633))


### BREAKING CHANGES

* 💥 node v16 is no longer supported

# [4.0.0](https://github.com/jimmy-guzman/gitzy/compare/v3.5.1...v4.0.0) (2023-08-24)


### Features

* ✨ support node v20, drop support for v14 ([424a113](https://github.com/jimmy-guzman/gitzy/commit/424a1135ba652355e6a2a17e996e453642d4e468))
* **deps:** ✨ bump `commander` to v11.0.0 ([c3de75b](https://github.com/jimmy-guzman/gitzy/commit/c3de75bec4533832273f9aac43b114a9e0e4155f))


### BREAKING CHANGES

* 💥 node v14 is no longer supported

## [3.5.1](https://github.com/jimmy-guzman/gitzy/compare/v3.5.0...v3.5.1) (2023-08-24)


### Bug Fixes

* **deps:** 🐛 bump `yaml` to v2.2.2 to fix security vulnerability ([a91ea7d](https://github.com/jimmy-guzman/gitzy/commit/a91ea7d148f06fe7ac2f2c213e6aff8dad49e9f8))

# [3.5.0](https://github.com/jimmy-guzman/gitzy/compare/v3.4.0...v3.5.0) (2023-08-24)


### Features

* **build:** ✨ use `pkgroll` for simpler bundling and less deps ([f331fdb](https://github.com/jimmy-guzman/gitzy/commit/f331fdb7fdfe92d3af61ea8fc1a1ebccf69d8c1c))

# [3.4.0](https://github.com/jimmy-guzman/gitzy/compare/v3.3.0...v3.4.0) (2022-08-14)


### Features

* **cli:** ✨ allow issues hint to be customized w/ `issuesHint` option ([989d839](https://github.com/jimmy-guzman/gitzy/commit/989d839d32ddec0915e7c9c6d5aca7a2ba22f170)), closes [#337](https://github.com/jimmy-guzman/gitzy/issues/337)

# [3.3.0](https://github.com/jimmy-guzman/gitzy/compare/v3.2.0...v3.3.0) (2022-07-24)


### Features

* **deps:** ✨ bump `yaml` to v2 ([91d24e8](https://github.com/jimmy-guzman/gitzy/commit/91d24e86eed23cd7e20ff0ea7c246bb8e7e7438e))

# [3.2.0](https://github.com/jimmy-guzman/gitzy/compare/v3.1.0...v3.2.0) (2022-03-14)


### Features

* **deps:** ✨ bump `commander` to `^9.0.0` ([d87a057](https://github.com/jimmy-guzman/gitzy/commit/d87a0576abb641b1a9bad932f29229aa281f4e85))

# [3.1.0](https://github.com/jimmy-guzman/gitzy/compare/v3.0.0...v3.1.0) (2022-01-15)


### Bug Fixes

* 🐛 wrap correctly when there are quotes in the message ([92c0121](https://github.com/jimmy-guzman/gitzy/commit/92c0121625f00d04938141582f18897b8a4ad3ca))


### Features

* ✨ replace `cosmiconfig` w/ `lilconfig` & `yaml` to reduce deps ([391425a](https://github.com/jimmy-guzman/gitzy/commit/391425a24cdf633481f3662063c182e3301d916d)), closes [#249](https://github.com/jimmy-guzman/gitzy/issues/249)

# [3.0.0](https://github.com/jimmy-guzman/gitzy/compare/v2.1.0...v3.0.0) (2022-01-14)


### chore

* **deps:** 🤖 remove node 12 support ([9550bce](https://github.com/jimmy-guzman/gitzy/commit/9550bcee7294433b5b528f6c2d5682e7c1f5edcc))


### BREAKING CHANGES

* **deps:** 💥 minimum node version is 14

# [2.1.0](https://github.com/jimmy-guzman/gitzy/compare/v2.0.1...v2.1.0) (2021-11-09)


### Bug Fixes

* **cli:** 🐛 prevent wraping if `headerMaxLength` is over `72` ([9b1ed6b](https://github.com/jimmy-guzman/gitzy/commit/9b1ed6b384cb67ffcb0de0b779ded868a83f1c3a))


### Features

* **cli:** ✨ add `skip when none` hint to breaking change prompt ([614f502](https://github.com/jimmy-guzman/gitzy/commit/614f502210c4ae49c203ce12599737d4a3090422))

## [2.0.1](https://github.com/jimmy-guzman/gitzy/compare/v2.0.0...v2.0.1) (2021-09-17)


### Bug Fixes

* **cli:** 🐛 strict matches should appear first ([7327ed8](https://github.com/jimmy-guzman/gitzy/commit/7327ed857f090d96de79c1f2dc821eba9a340284))

# [2.0.0](https://github.com/jimmy-guzman/gitzy/compare/v1.4.0...v2.0.0) (2021-09-17)


### chore

* **deps:** 🤖 remove node 10 support ([8e2d743](https://github.com/jimmy-guzman/gitzy/commit/8e2d7433db39acf1cf504e95b929e9f806e766f2))


### BREAKING CHANGES

* **deps:** 💥 minimum node version is 12

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
