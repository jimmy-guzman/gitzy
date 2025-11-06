## [6.5.3](https://github.com/jimmy-guzman/gitzy/compare/v6.5.2...v6.5.3) (2025-11-06)


### Bug Fixes

* **deps:** 🐛 bump `tinyexec` to v1.0.2 ([#603](https://github.com/jimmy-guzman/gitzy/issues/603)) ([abec4be](https://github.com/jimmy-guzman/gitzy/commit/abec4be60d1844d51ba6e3f2f1c43c41bb7e1f45))

## [6.5.2](https://github.com/jimmy-guzman/gitzy/compare/v6.5.1...v6.5.2) (2025-10-30)


### Bug Fixes

* 🐛 avoid confusing language in flag descriptions ([762b4a9](https://github.com/jimmy-guzman/gitzy/commit/762b4a9c82e532d0102fe2d87a018ce952ae86e7))
* **cli:** 🐛 don't include breaking change footer when just `--breaking` ([c7c4a12](https://github.com/jimmy-guzman/gitzy/commit/c7c4a12341f096f3daf4bbacdc560d7eceb52087))

## [6.5.1](https://github.com/jimmy-guzman/gitzy/compare/v6.5.0...v6.5.1) (2025-10-29)


### Bug Fixes

* 🐛 cursor within body prompt is nolonger lost ([1bb3494](https://github.com/jimmy-guzman/gitzy/commit/1bb349426d815e913fd2c665d53355ded459ba4e))
* **cli:** 🐛 use 🔄 as default refactor emoji for consistent rendering ([d22d915](https://github.com/jimmy-guzman/gitzy/commit/d22d9154f9c809c54b8ceb237488dd4020b36cd4))

# [6.5.0](https://github.com/jimmy-guzman/gitzy/compare/v6.4.1...v6.5.0) (2025-10-28)


### Features

* ✨ improve validation by using schema based parser ([#590](https://github.com/jimmy-guzman/gitzy/issues/590)) ([f5a0a6a](https://github.com/jimmy-guzman/gitzy/commit/f5a0a6aff36cbf17a74ac76e1c4fbac8b3d277b1))

## [6.4.1](https://github.com/jimmy-guzman/gitzy/compare/v6.4.0...v6.4.1) (2025-10-27)


### Bug Fixes

* 🐛 actually support `.mjs` extension in config files ([#589](https://github.com/jimmy-guzman/gitzy/issues/589)) ([17c78e8](https://github.com/jimmy-guzman/gitzy/commit/17c78e8eed9d200fdb3bc5c7506b93b50ccc4445))

# [6.4.0](https://github.com/jimmy-guzman/gitzy/compare/v6.3.0...v6.4.0) (2025-10-27)


### Features

* **cli:** ✨ bundle dependencies for faster execution ([#587](https://github.com/jimmy-guzman/gitzy/issues/587)) ([287e437](https://github.com/jimmy-guzman/gitzy/commit/287e4374ab68903e5d22e08a1d5f168574a7ad2b))

# [6.3.0](https://github.com/jimmy-guzman/gitzy/compare/v6.2.0...v6.3.0) (2025-10-26)


### Features

* ✨ add `breakingChangeFormat` option for "!" syntax support ([#584](https://github.com/jimmy-guzman/gitzy/issues/584)) ([1362526](https://github.com/jimmy-guzman/gitzy/commit/13625264a313da27eadaac12d752107545a300c2))

# [6.2.0](https://github.com/jimmy-guzman/gitzy/compare/v6.1.1...v6.2.0) (2025-10-26)


### Features

* ✨ support multiple issues with full syntax ([#583](https://github.com/jimmy-guzman/gitzy/issues/583)) ([2d2ca3f](https://github.com/jimmy-guzman/gitzy/commit/2d2ca3fcb2a161c8041c033078359965e115b4ae))

## [6.1.1](https://github.com/jimmy-guzman/gitzy/compare/v6.1.0...v6.1.1) (2025-10-26)


### Bug Fixes

* 🐛 improve git commands execution & cross-platform support ([e5df0fa](https://github.com/jimmy-guzman/gitzy/commit/e5df0fa3e9ed71028bf1a0e639598a2082bc195a))
* 🐛 should handle single characters w/ autocomplete ([f269c6b](https://github.com/jimmy-guzman/gitzy/commit/f269c6b45afe4901843a755827c754d0683ae109))
* 🐛 should NOT do git checks during `--hook` ([88f582d](https://github.com/jimmy-guzman/gitzy/commit/88f582d6d17ad23ce8e2745b05dbcefe3eaa0739))

# [6.1.0](https://github.com/jimmy-guzman/gitzy/compare/v6.0.0...v6.1.0) (2025-10-25)


### Bug Fixes

* **deps:** 🐛 bump `vite` to fix CWE-22 ([b535bcc](https://github.com/jimmy-guzman/gitzy/commit/b535bccd5d242fc440dc773262277712d587a43c))


### Features

* ✨ improve fuzzy matching with `@leeoniya/ufuzzy` ([43f591a](https://github.com/jimmy-guzman/gitzy/commit/43f591af98aad75951d8cd465e1446c051aea998))

# [6.0.0](https://github.com/jimmy-guzman/gitzy/compare/v5.9.0...v6.0.0) (2025-10-05)


### Bug Fixes

* 🐛 add missing `cause` in errors ([e0460ba](https://github.com/jimmy-guzman/gitzy/commit/e0460bab4538f5390993f1dd38300f10fa973403))
* 🐛 bump `yaml` to v2.8.1 ([605bfa7](https://github.com/jimmy-guzman/gitzy/commit/605bfa7bddbc0b92aa7b42fff63cbd20434d0bb6))


### Features

* ✨ bump `commander` to v14 ([182ad82](https://github.com/jimmy-guzman/gitzy/commit/182ad82bda02fe41de68b05a5d6ceab97677cd66))
* ✨ drop support for node v18 ([6f5a52c](https://github.com/jimmy-guzman/gitzy/commit/6f5a52c4a79ce75c282cfa73de1939e0bd14ac43))
* ✨ use native `styleText` instead of `ansi-colors` ([25217bc](https://github.com/jimmy-guzman/gitzy/commit/25217bc32361644ad95843694ae87fdd2403f04c))


### BREAKING CHANGES

* 💥 node v18 is no longer supported

# [5.9.0](https://github.com/jimmy-guzman/gitzy/compare/v5.8.1...v5.9.0) (2025-06-21)


### Features

* ✨ bump `yaml` to v2.8.0 ([5b3ee95](https://github.com/jimmy-guzman/gitzy/commit/5b3ee95c047914a1d24bfc0797eda589761e6ac8))
* ✨ drop `fuse.js` to improve bundle size ([333ad81](https://github.com/jimmy-guzman/gitzy/commit/333ad814dce724d60edddee5c87f88689c242f31))

## [5.8.1](https://github.com/jimmy-guzman/gitzy/compare/v5.8.0...v5.8.1) (2025-03-07)


### Bug Fixes

* 🐛 only disable escaping for non hook messages ([#520](https://github.com/jimmy-guzman/gitzy/issues/520)) ([b2eb2f9](https://github.com/jimmy-guzman/gitzy/commit/b2eb2f90a145d34df4178f7120f2838c2f282bac))

# [5.8.0](https://github.com/jimmy-guzman/gitzy/compare/v5.7.1...v5.8.0) (2025-03-02)


### Features

* ✨ add option `--hook` to help w/ `prepare-commit-msg` ([#516](https://github.com/jimmy-guzman/gitzy/issues/516)) ([2515af5](https://github.com/jimmy-guzman/gitzy/commit/2515af5c24f03fb27c2a7ec214dbeafc09ebdc03)), closes [#511](https://github.com/jimmy-guzman/gitzy/issues/511)

## [5.7.1](https://github.com/jimmy-guzman/gitzy/compare/v5.7.0...v5.7.1) (2024-11-17)


### Bug Fixes

* 🐛 pin `enquirer` v2.3.6 to support "*" ([#488](https://github.com/jimmy-guzman/gitzy/issues/488)) ([7bc2b0d](https://github.com/jimmy-guzman/gitzy/commit/7bc2b0dd625224374c0a66648b385fc82d5436c3))

# [5.7.0](https://github.com/jimmy-guzman/gitzy/compare/v5.6.0...v5.7.0) (2024-11-10)


### Bug Fixes

* 🐛 bump `lilconfig` to v3.1.2 ([e15942b](https://github.com/jimmy-guzman/gitzy/commit/e15942b9d6617733860050a0d6cacf18e20da804))


### Features

* ✨ bump `commander` to v12.1.0 ([1944583](https://github.com/jimmy-guzman/gitzy/commit/19445839f0ab29414f4bec389a127fe46c7c7023))
* ✨ bump `enquirer` to v2.4.1 ([975ffc9](https://github.com/jimmy-guzman/gitzy/commit/975ffc918f73ccf3cec700a94897b241b0a02302))
* ✨ bump `yaml` to v2.6.0 ([34533a3](https://github.com/jimmy-guzman/gitzy/commit/34533a3f465b0e5274d7f0b9a994c4130d491be0))

# [5.6.0](https://github.com/jimmy-guzman/gitzy/compare/v5.5.0...v5.6.0) (2024-11-07)


### Features

* ✨ add support for node v22 ([#481](https://github.com/jimmy-guzman/gitzy/issues/481)) ([3223221](https://github.com/jimmy-guzman/gitzy/commit/3223221f3c06ab3871f24a44c93490f773b17df3))

# [5.5.0](https://github.com/jimmy-guzman/gitzy/compare/v5.4.0...v5.5.0) (2024-11-01)


### Features

* ✨ improve performance and add messages to errors ([08aecf4](https://github.com/jimmy-guzman/gitzy/commit/08aecf470e259e10e0cb29b3d96981908da3606b))

# [5.4.0](https://github.com/jimmy-guzman/gitzy/compare/v5.3.0...v5.4.0) (2024-06-04)


### Features

* ✨ improve fuzzy search by including hints ([394ebf3](https://github.com/jimmy-guzman/gitzy/commit/394ebf3c858480af70567d5e491075fc23b43179))

# [5.3.0](https://github.com/jimmy-guzman/gitzy/compare/v5.2.0...v5.3.0) (2024-04-10)


### Features

* ✨ support load ESM configuration ([da29e84](https://github.com/jimmy-guzman/gitzy/commit/da29e84fbdfccdb72e2aba64b9fe503114e95e1a))

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

* **cli:** 🐛 prevent wrapping if `headerMaxLength` is over `72` ([9b1ed6b](https://github.com/jimmy-guzman/gitzy/commit/9b1ed6b384cb67ffcb0de0b779ded868a83f1c3a))


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
