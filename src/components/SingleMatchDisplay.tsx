import * as React from "react";
import * as _ from "lodash";
import * as $ from "jquery";
import "whatwg-fetch";
import { TiltyardMatch, TiltyardGameRawMetadata } from "../types";
import { MatchInfo } from "./MatchInfo";
import { applyXslt } from "../util/xslt";
import { Visualization } from "./Visualization";

export interface SingleMatchDisplayProps {
  matchId: string;
}

export interface SingleMatchDisplayState {
  match?: TiltyardMatch;
  gameText?: string;
  gameMetadata?: TiltyardGameRawMetadata;
  stylesheet?: string;
}

function toElement(node: Node): JSX.Element {
  return <span> { node } </span>;  
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
            this.setState((prevState, props) => (_.assign({}, prevState, { gameMetadata: game, gameText: body })));

            //TODO: Clean these parts up, maybe? Or will the browser do the caching for me?
            // TODO: In-memory caching, if not already available
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
        { this.state.match ? this.getMatchSidebar() : "Loading..."  }
      </div>
      <div className="mainPanel" key="mainPanel">
        <div id="vizPanel">
          { this.getVizPanel() }
        </div>
      </div>
    </div>;
  }

  getVizPanel(): JSX.Element {
    if (!this.state.match) {
      return <text>{"Loading match " + this.props.matchId + "..."}</text>;
    } else if (!this.state.gameMetadata) {
      return <text>Loading game metadata...</text>;
    } else if (!this.state.stylesheet) {
      return <text>Loading game stylesheet...</text>;
    } else {
      //TODO: Do visualization asynchronously
      return <Visualization visualization={applyXslt($.parseXML(this.getMatchXml()), $.parseXML(this.state.stylesheet))} />
    }
  }

  getMatchXml(): string {
    let states = this.state.match.states;
    let stateString = states[states.length - 1];

    //Remove outer parentheses
    stateString = stateString.trim();
    stateString = stateString.slice(1, stateString.length - 1).trim();

    //Convert into facts, then XML
    let xml = "<state>" + this.toFacts(stateString) + "</state>";
    return xml;
  }

  toFacts(stateString: string): string {
    let tokens = stateString.split(" ");
    let factsXml = "";

    let index = 0;
    let depth = 0;
    while (index < tokens.length) {
      const token = tokens[index];
      if (token === "(") {
        if (depth === 0) {
          factsXml += "<fact>";
        } else {
          factsXml += "<argument>";
        }
        index++;
        const name = tokens[index];
        factsXml += "<relation>" + name + "</relation>";

        depth++;
      } else if (token === ")") {
        depth--;
        if (depth === 0) {
          factsXml += "</fact>";
        } else {
          factsXml += "</argument>";
        }
      } else {
        factsXml += "<argument>" + token + "</argument>";
      }

      index++;
    }
    return factsXml;
  }

  getMatchSidebar(): JSX.Element {
    return <MatchInfo match={this.state.match} gameMetadata={this.state.gameMetadata} />
  }
}
