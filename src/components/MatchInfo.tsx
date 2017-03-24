import * as $ from "jquery";
import * as React from "react";
import { TiltyardMatch, TiltyardGameRawMetadata } from "../types";
import { MovesTable } from "./MovesTable";

export interface MatchInfoProps {
  match: TiltyardMatch;
  gameMetadata?: TiltyardGameRawMetadata;
  turnNumber?: number;
  setTurnNumber: (turnNumber: number) => void;
}

export class MatchInfo extends React.Component<MatchInfoProps, {}> {
  render() {
    return <div>
      <p>Game: { this.getGameName() }</p>
      <p>Start clock: {this.props.match.startClock}<br/>
         Play clock: {this.props.match.playClock}</p>
      <div>Players involved:<br/>
        {this.getPlayersInvolved()}</div>
      <MovesTable roleNames={this.props.gameMetadata && this.props.gameMetadata.roleNames}
         movesByTurn={this.props.match.moves}
         turnNumber={this.props.turnNumber}
         setTurnNumber={this.props.setTurnNumber} />
    </div>
  }

  getGameName() {
    const metaUrl = this.props.match.gameMetaURL;
    if (this.props.gameMetadata) {
      const searchTerm = "//games.ggp.org/";
      let foundIndex = metaUrl.indexOf(searchTerm);
      if (foundIndex >= 0) {
        let repoStartIndex = foundIndex + searchTerm.length;
        let repoEndIndex = metaUrl.indexOf("/", repoStartIndex);
        let repoName = metaUrl.slice(repoStartIndex, repoEndIndex);
        let slashAfterGamesIndex = metaUrl.indexOf("/", repoEndIndex + 1);
        const humanUrl = metaUrl.slice(0, foundIndex)
          + "//www.ggp.org/view/all/games/"
          + repoName
          + metaUrl.slice(slashAfterGamesIndex);
        return <a href={humanUrl}>{this.props.gameMetadata.gameName}</a>
      }
      return <text>{this.props.gameMetadata.gameName}</text>
    }
    return <text>{metaUrl}</text>;
  }

  getPlayersInvolved(): JSX.Element[] {
    if (this.props.gameMetadata && this.props.gameMetadata.roleNames) {
      return this.props.match.playerNamesFromHost.map((playerName, index) => {
        return <div key={index}>{playerName} as {this.props.gameMetadata.roleNames[index]}</div>;
      });
    } else {
      return this.props.match.playerNamesFromHost.map((playerName, index) => {
        return <div key={index}>{playerName} as player {index + 1}</div>;
      });
    }
  }
}
