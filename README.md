# tiltyard-viewer
An alternative match viewer for Tiltyard, in the form of a single-page app.

Built with TypeScript and React.

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
