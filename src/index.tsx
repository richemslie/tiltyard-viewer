import * as React from "react";
import * as ReactDOM from "react-dom";

import { Hello } from "./components/Hello";
import { MatchInfo, MatchInfoProps } from "./components/MatchInfo";

let props: MatchInfoProps = {
    matchId: "tiltyard12345",
    game: { name: "breakthrough" },
    playerNames: ["Alloy", "GreenShell"],
    startClock: 180,
    playClock: 15,
};

ReactDOM.render(
    // <Hello compiler="TypeScript" framework="React" />,
    <MatchInfo {...props} />,
    document.getElementById("example")
);
