import * as React from "react";
import { TiltyardMatch } from "../types.ts";

export interface MatchInfoProps {
  // matchId: string;
  // game: Game;
  // playerNames: string[];
  // startClock: number;
  // playClock: number;
  match: TiltyardMatch;
}

export class MatchInfo extends React.Component<MatchInfoProps, {}> {
  render() {
    return <div>
      <p>Game: {this.props.match.gameMetaURL}</p>
      <p>Start clock: {this.props.match.startClock}<br/>
         Play clock: {this.props.match.playClock}</p>
      <p>Players involved:<br/>
        {this.getPlayersInvolved()}</p>
    </div>
  }

  getPlayersInvolved(): JSX.Element[] {
    return this.props.match.playerNamesFromHost.map(playerName => {
      return <div>{playerName} as (role goes here)</div>;
    });
  }
}
