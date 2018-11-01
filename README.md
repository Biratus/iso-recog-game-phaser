# Phaser 3 Typescript ES6 Boilerplate

[Phaser 3](https://phaser.io) multiplatform boileplate with Typescript Webpack Core and bare Android application with fullscreen WebView.

## Prerequisites

- [NodeJS with NPM](https://nodejs.org)
- Android Development Environment (e.g. [Android Studio](https://developer.android.com/studio/index.html))

### Recommended NPM packages installed globally:

- [Yarn](https://yarnpkg.com/lang/en/)
- [cross-env](https://www.npmjs.com/package/cross-env)

## Development

1. Clone this boileplate with `git clone https://github.com/vladfaust/phaser3-boilerplate.git`
2. `cd core && yarn`
3. Create `.env` file like `.env.example` - this will will be used *only* for development
4. Run `yarn dev` and open `http://localhost:8080`
5. Develop your game starting from `src/index.ts`

## Building

### HTML5

Build an HTML5 game with `yarn build:web`. See `core/build/web` for output.

### Android

1. Build an HTML5 game optimized for Android with `yarn build:android`. 
2. Copy `core/build/android` to `android/app/src/main/assets` so `index.html` is directly under `assets` folder.
3. Update your Android game with icons etc.

## Contributors

[@vladfaust](https://github.com/vladfaust) - Creator
