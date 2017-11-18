# tiltyard-viewer
An alternative match viewer for Tiltyard, in the form of a single-page app.

Built with TypeScript and React.

Development tips:
* Install [Node.js](https://nodejs.org/en/download/) and [yarn](https://yarnpkg.com/lang/en/docs/install/) if you don't already have them.
* From the project's root directory, run `yarn install` to install its dependencies.
* Run `yarn build` to compile the project into the `dist/` directory. (You will need to rerun this after any changes to the source.)
* Open the `index.html` file in the project's root directory in your browser.

TODOs:
- Deploy!
- Match list:
  - Indicate which match is currently shown
  - Ability to open match in new tab (via e.g. middle-click)
  - Visual indicator of completion/abandonment
- Moves list
  - Ability to display timing data
  - Better specification of its height (flex inside vh-limited div)
- Adjust match visualization to available screen space (?)
- Use a nice sans-serif font
- Filter down matches by player(s), game(s), or tournament
  - UI for choosing these
  - When filtered by player, follow new matches as they start
- Ability to load more matches
- Deconflict global and local loads of game metadata
