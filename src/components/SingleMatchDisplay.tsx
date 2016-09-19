import * as React from "react";
import * as _ from "lodash";
import "whatwg-fetch";
import { TiltyardMatch, TiltyardGameRawMetadata } from "../types";
import { MatchInfo } from "./MatchInfo";

export interface SingleMatchDisplayProps {
  matchId: string;
}

export interface SingleMatchDisplayState {
  match?: TiltyardMatch;
  gameText?: string;
  gameMetadata?: TiltyardGameRawMetadata;
  stylesheet?: string;
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
        let match: TiltyardMatch = JSON.parse(body);
        this.setState((prevState, props) => (_.assign({}, prevState, { match })));
        fetch(match.gameMetaURL)
          .then((response) => { return response.text() })
          .then((body) => {
            let game: TiltyardGameRawMetadata = JSON.parse(body);
            this.setState((prevState, props) => (_.assign({}, prevState, { game, gameText: body })));

            //TODO: Clean these parts up, maybe? Or will the browser do the caching for me?
            if (game.stylesheet) {
              let stylesheetUrl = match.gameMetaURL + game.stylesheet
              fetch(stylesheetUrl)
                .then((response) => { return response.text() })
                .then((body) => {
                  //TODO: Do something with this
                  let stylesheet: string = body;
                  this.setState((prevState, props) => (_.assign({}, prevState, { stylesheet })));
                });
            }
          });
    });
  }

  render() {

    return <div className="singleMatchDisplay">
      <div className="sidePanel" key="sidePanel">
        {/* TODO: Make this its own panel? */}
        { this.state.match ? this.getMatchSidebar(this.state.match) : "Loading match " + this.props.matchId + "..."  }
        Match info goes here
      </div>
      <div className="mainPanel" key="mainPanel">
        { this.state.match ? this.getMatchViz() : "Loading match " + this.props.matchId + "..."  }
        { this.state.gameText ? "Game text is " + this.state.gameText : "Loading game..." }
        { this.state.stylesheet ? "Stylesheet is " + this.state.stylesheet : "Loading stylesheet..." }
      </div>
    </div>;
  }

  getMatchSidebar(match: TiltyardMatch): JSX.Element {
    return <MatchInfo match={match} />
  }

  getMatchViz(): JSX.Element[] {
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
