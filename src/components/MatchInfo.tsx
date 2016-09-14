import * as React from "react";
import {Game} from "../types.ts";

export interface MatchInfoProps {
  matchId: string;
  game: Game;
  playerNames: string[];
  startClock: number;
  playClock: number;
}

export class MatchInfo extends React.Component<MatchInfoProps, {}> {
  render() {
    // return <h1>Hello from {this.props.compiler} and {this.props.framework}!</h1>;
    return <div>
      <p>Game: {this.props.game.name}</p>
      <p>Start clock: {this.props.startClock}<br/>
         Play clock: {this.props.playClock}</p>
      <p>Players involved:<br/>
        {this.getPlayersInvolved()}</p>
    </div>
  }

  getPlayersInvolved(): JSX.Element[] {
    return this.props.playerNames.map(playerName => {
      return <div>{playerName} as (role goes here)</div>;
    });
  }
}
