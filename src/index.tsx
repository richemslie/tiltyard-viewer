import * as React from "react";
import * as ReactDOM from "react-dom";
import { MatchSelectingDisplay } from "./components/MatchSelectingDisplay";
import { MatchInfo, MatchInfoProps } from "./components/MatchInfo";
import { SingleMatchDisplay, SingleMatchDisplayProps } from "./components/SingleMatchDisplay";


// Hex
let matchId = "http://matches.ggp.org/matches/99b8572c92c9b236867f8bb8d94bb3bf9645bf51/";
// Rubik's cube: unlike Tiltyard, works fine in Firefox
// let matchId = "http://matches.ggp.org/matches/b17fa24a19287f86b105f55cb773a71ff85732e5/";
// Atari Go: unlike Tiltyard, works fine in Firefox
// let matchId = "http://matches.ggp.org/matches/f914263d7d835a25a3e2786119afdc5695eb080c/";

// Futoshiki: unlike Tiltyard, works fine in Firefox
// let matchId = "http://matches.ggp.org/matches/7b74341129a31b5d350d2faff03f7aece9c1f809/";
// Queens puzzle: unlike Tiltyard, works fine in Firefox
// let matchId = "http://matches.ggp.org/matches/f1a02a02cb688a2ddb90e1f6c861a27cc77ac9a1/";
// Shogi: images are still broken
// let matchId = "http://matches.ggp.org/matches/10ffda3dc534132e5188beb8acfdf0a772a383ab/";

declare var require: {
  <T>(path: string): T;
  (paths: string[], callback: (...modules: any[]) => void): void;
  ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

require('!style!css!./index.css');

ReactDOM.render(
  // <SingleMatchDisplay matchUrl={matchId} />,
  <MatchSelectingDisplay />,
  document.getElementById("example")
);
