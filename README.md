<img src="src/assets/img/icon-240.png" width="80">

# Once

Once is a Chrome Extension that helps users limit the usage of time-consuming websites.

This extension uses:

- [React 17](https://reactjs.org)
- [Webpack 5](https://webpack.js.org/)
- [React Hot Loader](https://github.com/gaearon/react-hot-loader)
- [eslint-config-react-app](https://www.npmjs.com/package/eslint-config-react-app)
- [Prettier](https://prettier.io/)
- [TypeScript](https://www.typescriptlang.org/)

## Installing and Running

### Procedures:

1. Install [Docker](https://www.docker.com/) to setup a simple NodeJS/Yarn dev environment.
2. Clone this repository.
3. Run `docker-compose up --build` to build and run the container (this will run `yarn start` which will execute `node utils/webserver.js`).
4. Load your extension on Chrome following:
   1. Access `chrome://extensions/`
   2. Check `Developer mode`
   3. Click on `Load unpacked extension`
   4. Select the `build` folder.

## Webpack auto-reload and HRM

Once uses the [webpack server](https://webpack.github.io/docs/webpack-dev-server.html) to development (started with `yarn start`) with auto reload feature that reloads the browser automatically every time that you save some file in your editor.

You can run the dev mode on other port if you want. Just specify the env var `port` in the `docker-compose.yml` file.

## Packing

```
docker-compose run app yarn build
```

Now, the content of `build` folder will be the extension ready to be submitted to the Chrome Web Store.

---

Youcef Es-skouri | [Website](https://cef.im)
