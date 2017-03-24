import * as $ from "jquery";
import * as _ from "lodash";
import * as React from "react";
import "whatwg-fetch";
import { getHtmlDestructively } from "../util/html";
import { applyXslt } from "../util/xslt";
import { TiltyardGameRawMetadata, TiltyardMatch } from "../types";
import { RawHtmlVisualization } from "./RawHtmlVisualization";
import { MatchInfo } from "./MatchInfo";

export interface SingleMatchDisplayProps {
  matchId: string;
}

export interface SingleMatchDisplayState {
  match?: TiltyardMatch;
  gameText?: string;
  gameMetadata?: TiltyardGameRawMetadata;
  stylesheet?: string;
  turnNumber?: number;
  computedVisualizationsByTurn: VizCache;
  // computedVisualizationsByTurn: Node[];
}

export interface VizCache {
  [index: number]: string;
}

function toElement(node: Node): JSX.Element {
  return <span> { node } </span>;  
}

export class SingleMatchDisplay extends React.Component<SingleMatchDisplayProps, SingleMatchDisplayState> {
  constructor(props: SingleMatchDisplayProps) {
    super(props);
    this.state = { computedVisualizationsByTurn: [] };
  }

  componentDidMount() {
    let matchId = this.props.matchId;
    let matchJsonUrl =  "http://matches.ggp.org/matches/"+matchId+"/";
    fetch(matchJsonUrl)
      .then((response) => { return response.text() })
      .then((body) => {
        let match: TiltyardMatch = JSON.parse(body);
        this.setState({ match } as any as SingleMatchDisplayState);
        let turnNumber = -1;
        if (match.states.length > 0) {
          turnNumber = match.states.length - 2;
          this.setState({ turnNumber } as any as SingleMatchDisplayState);
        }
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
                  if (turnNumber >= 0) {
                    this.startComputingVizForTurn(turnNumber);
                  }
                });
            }
          });
    });
  }

  startComputingVizForTurn(turnNumber: number) {
    console.info("Triggering computation of viz for turn " + turnNumber);
    new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (this.state.computedVisualizationsByTurn[turnNumber]) {
          console.info("Skipping computing viz for turn " + turnNumber);
          // Already computed
          console.info("Heyo");
        } else {
          console.info("Computing viz for turn " + turnNumber);
          const matchXml = $.parseXML(this.getMatchXml(turnNumber));
          const stylesheetXml = $.parseXML(this.state.stylesheet);
          const visualizationNode = applyXslt(matchXml, stylesheetXml);

          const visualizationHtml = getHtmlDestructively(visualizationNode);

          console.info("Resolving viz for turn " + turnNumber);
          resolve(visualizationHtml);
        }
      });
    }).then((visualizationHtml: string) => {
      console.info("Entering 'then'");
      if (this.state.computedVisualizationsByTurn[turnNumber]) {
        console.info("Skipping storing viz for turn " + turnNumber);
        // Already computed
        return;
      }
      console.info("Storing viz for turn " + turnNumber);
      let cache = this.state.computedVisualizationsByTurn;
      let updatedCache = _.clone(cache);
      updatedCache[turnNumber] = visualizationHtml;
      // let updatedCache = _.assign({}, cache, {"turnNumber": visualization});
      // let updatedCache = cache.slice();//_.assign({}, cache, {turnNumber: visualization});
      // updatedCache[turnNumber] = visualization;
      this.setState({ computedVisualizationsByTurn: updatedCache });
      console.info("Stored viz for turn " + turnNumber);
      console.info("Updated cache keys: " + _.keys(updatedCache));
    });
    console.info("Leaving startComputingVizForTurn");
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

  getVizPanel(): React.ReactChild {
    if (!this.state.match) {
      return "Loading match " + this.props.matchId + "...";
    } else if (!this.state.gameMetadata) {
      return "Loading game metadata...";
    } else if (!this.state.stylesheet) {
      return "Loading game stylesheet...";
    } else if (!this.state.computedVisualizationsByTurn[this.getTurnNumber()]) {
      return "Generating visualization...";
    } else {
      let visualization = this.state.computedVisualizationsByTurn[this.getTurnNumber()];
      console.info("Is viz undefined?: " + (visualization === undefined));
      return <RawHtmlVisualization html={visualization} />
    }
  }

  getTurnNumber(): number {
    if (this.state.turnNumber != undefined) {
      return this.state.turnNumber;
    }
    // No turn manually selected: show the most recent turn
    return this.state.match.states.length - 1;
  }

  getMatchXml(turnNumber: number): string {
    // let states = this.state.match.states;
    // let turnNumber = this.state.turnNumber || states.length - 1;
    let stateString = this.state.match.states[turnNumber];

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
    return <MatchInfo match={this.state.match} 
              gameMetadata={this.state.gameMetadata} 
              turnNumber={this.state.turnNumber}
              setTurnNumber={(turnNumber: number) => this.setTurnNumber(turnNumber)} />
  }

  setTurnNumber(turnNumber: number) {
    this.startComputingVizForTurn(turnNumber);
    this.setState({ turnNumber } as any as SingleMatchDisplayState);
  }
}
