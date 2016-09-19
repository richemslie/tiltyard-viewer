import * as React from "react";
import * as ReactDOM from "react-dom";

import { MatchInfo, MatchInfoProps } from "./components/MatchInfo";
import { SingleMatchDisplay, SingleMatchDisplayProps } from "./components/SingleMatchDisplay";

let props: MatchInfoProps = {
  matchId: "tiltyard12345",
  game: { name: "breakthrough" },
  playerNames: ["Alloy", "GreenShell"],
  startClock: 180,
  playClock: 15,
};

let matchId = "99b8572c92c9b236867f8bb8d94bb3bf9645bf51";

let matchInfoUrl = "http://matches.ggp.org/matches/"+matchId+"/";

declare var require: {
  <T>(path: string): T;
  (paths: string[], callback: (...modules: any[]) => void): void;
  ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
};

require('!style!css!./index.css');

ReactDOM.render(
  // <MatchInfo {...props} />,
  <SingleMatchDisplay matchId={matchId} />,
  document.getElementById("example")
);
