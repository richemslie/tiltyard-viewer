import * as React from "react";
import "whatwg-fetch";
import { TiltyardMatch } from "../types";

export interface SingleMatchDisplayProps {
  matchId: string;
}

export interface SingleMatchDisplayState {
  match?: TiltyardMatch;
}

export class SingleMatchDisplay extends React.Component<SingleMatchDisplayProps, SingleMatchDisplayState> {
  constructor(props: SingleMatchDisplayProps) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    let matchId = this.props.matchId;
    let matchJsonUrl =  "http://matches.ggp.org/matches/"+matchId+"/";
    fetch(matchJsonUrl)
      .then((response) => { return response.text() })
      .then((body) => {
         this.setState((prevState, props) => ({ match: JSON.parse(body) }))
         });
  }

  render() {

    return <div className="singleMatchDisplay">
      <div className="sidePanel" key="sidePanel">
        Match info goes here
      </div>
      <div className="mainPanel" key="mainPanel">
        { this.state.match ? this.getMatchInfo() : "Loading match " + this.props.matchId + "..."  }
      </div>
    </div>;
  }

  getMatchInfo(): JSX.Element[] {
    return [<div key="matchId">
      The match ID is {this.props.matchId}
    </div>,
    <div key="playerNames">
      The player names are {this.state.match.playerNamesFromHost.join(", ")}
    </div>,
    <div key="moves">
      The moves are: <ol>{this.state.match.moves.map(jointMove => {
        return <li>{jointMove.join(", ")}</li>
      })}</ol>
    </div>];
  }
}
