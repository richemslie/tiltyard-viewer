import * as $ from "jquery";
import * as _ from "lodash";
import * as React from "react";
import "whatwg-fetch";
import { TiltyardGameRawMetadata, TiltyardMatch } from "../types";
import { getHtmlDestructively } from "../util/html";
import { applyXslt } from "../util/xslt";
import { MatchInfo } from "./MatchInfo";
import { RawHtmlVisualization } from "./RawHtmlVisualization";

export interface SingleMatchDisplayProps {
  matchUrl: string;
}

export interface SingleMatchDisplayState {
  match?: TiltyardMatch;
  gameText?: string;
  gameMetadata?: TiltyardGameRawMetadata;
  stylesheet?: string;
  turnNumber?: number;
  computedVisualizationsByTurn: VizCache;
}

export interface VizCache {
  [index: number]: string;
}

function toElement(node: Node): JSX.Element {
  return <span> { node } </span>;
}

export class SingleMatchDisplay extends React.Component<SingleMatchDisplayProps, SingleMatchDisplayState> {
  private reloadMatchRef: number;

  constructor(props: SingleMatchDisplayProps) {
    super(props);
    this.state = { computedVisualizationsByTurn: [] };
  }

  public render() {
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

  public componentWillReceiveProps(nextProps: Readonly<SingleMatchDisplayProps>, nextContext: any): void {
    if (this.props.matchUrl !== nextProps.matchUrl) {
      setTimeout(() => {
        this.setState({
          computedVisualizationsByTurn: [],
          gameMetadata: undefined,
          gameText: undefined,
          match: undefined,
          stylesheet: undefined,
          turnNumber: undefined,
        });
        this.loadGameAndMatch();
      });
    }
  }

  public componentDidMount() {
    this.loadGameAndMatch();

    // Set up keyboard shortcuts for changing states
    $(document).keypress((e) => {
      if (e.keyCode === 37 || e.keyCode === 97) {
        // Left arrow or 'A'
        this.decrementTurnNumber();
      } else if (e.keyCode === 38 || e.keyCode === 119) {
        // Up arrow or 'W'
        this.decrementTurnNumber();
      } else if (e.keyCode === 39 || e.keyCode === 100) {
        // Right arrow or 'D'
        this.incrementTurnNumber();
      } else if (e.keyCode === 40 || e.keyCode === 115) {
        // Down arrow or 'S'
        this.incrementTurnNumber();
      }
    });

    // Start the regular match reloader
    this.reloadMatchRef = setInterval(() => this.reloadMatchOnly(), 10000);
  }

  public componentWillUnmount() {
    clearInterval(this.reloadMatchRef);
  }

  private loadGameAndMatch() {
    let matchJsonUrl = this.props.matchUrl;
    fetch(matchJsonUrl)
      .then((response) => { return response.text(); })
      .then((body) => {
        let match: TiltyardMatch = JSON.parse(body);
        let turnNumber = 0;
        if (match.states.length > 0) {
          turnNumber = match.states.length - 1;
        }
        this.setState({ match, turnNumber });
        fetch(match.gameMetaURL)
          .then((response) => { return response.text(); })
          .then((gameMetadataText) => {
            let game: TiltyardGameRawMetadata = JSON.parse(gameMetadataText);
            this.setState((prevState, props) => (_.assign({}, prevState, { gameMetadata: game, gameText: body })));

            if (game.stylesheet) {
              let stylesheetUrl = match.gameMetaURL + game.stylesheet;
              fetch(stylesheetUrl)
                .then((response) => { return response.text(); })
                .then((stylesheet: string) => {
                  this.setState((prevState, props) => (_.assign({}, prevState, { stylesheet })));
                  this.startComputingVizForTurn(turnNumber);
                });
            }
          });
    });
  }

  private reloadMatchOnly() {
    if (this.state.match && (this.state.match.isCompleted || this.state.match.isAborted)) {
      // This match is over, don't reload it
      return;
    }

    let matchJsonUrl = this.props.matchUrl;
    fetch(matchJsonUrl)
      .then((response) => { return response.text(); })
      .then((body) => {
        let match: TiltyardMatch = JSON.parse(body);

        // Update the turn number if we're currently looking at the last turn
        const onLastTurn = (this.state.turnNumber === this.state.match.moves.length);
        if (onLastTurn) {
          let turnNumber = match.states.length - 1;
          // TODO: It would be nice if we could somehow hold off on this update until after the
          // new visualization has been rendered.
          this.setState({ match, turnNumber });
          this.startComputingVizForTurn(turnNumber);
        } else {
          this.setState({ match });
        }
      });
  }

  private decrementTurnNumber() {
    if (this.state.turnNumber != undefined
        && this.state.turnNumber > 0) {
      this.setTurnNumber(this.state.turnNumber - 1);
    }
  }

  private incrementTurnNumber() {
    if (this.state.turnNumber != undefined
        && this.state.match != undefined
        && this.state.turnNumber < this.state.match.states.length - 1) {
      this.setTurnNumber(this.state.turnNumber + 1);
    }
  }

  // TODO: We could now end up here without having gotten the stylesheet yet...
  // That will currently be a harmless error message, but we could explicitly handle that case
  private startComputingVizForTurn(turnNumber: number) {
    new Promise<string>((resolve, reject) => {
      setTimeout(() => {
        if (this.state.computedVisualizationsByTurn[turnNumber]) {
          // Already computed
        } else {
          const matchXml = $.parseXML(this.getMatchXml(turnNumber));
          const stylesheetXml = $.parseXML(this.state.stylesheet);
          const visualizationNode = applyXslt(matchXml, stylesheetXml);

          const visualizationHtml = getHtmlDestructively(visualizationNode);

          resolve(visualizationHtml);
        }
      });
    }).then((visualizationHtml: string) => {
      if (this.state.computedVisualizationsByTurn[turnNumber]) {
        // Already computed
        return;
      }
      let cache = this.state.computedVisualizationsByTurn;
      let updatedCache = _.clone(cache);
      updatedCache[turnNumber] = visualizationHtml;

      this.setState({ computedVisualizationsByTurn: updatedCache });
    });
  }

  private getVizPanel(): React.ReactChild {
    if (!this.state.match) {
      return "Loading match " + this.props.matchUrl + "...";
    } else if (!this.state.gameMetadata) {
      return "Loading game metadata...";
    } else if (!this.state.stylesheet) {
      return "Loading game stylesheet...";
    } else if (!this.state.computedVisualizationsByTurn[this.getTurnNumber()]) {
      return "Generating visualization...";
    } else {
      let visualization = this.state.computedVisualizationsByTurn[this.getTurnNumber()];
      return <RawHtmlVisualization html={visualization} />;
    }
  }

  private getTurnNumber(): number {
    if (this.state.turnNumber != undefined) {
      return this.state.turnNumber;
    }
    // No turn manually selected: show the most recent turn
    return this.state.match.states.length;
  }

  private getMatchXml(turnNumber: number): string {
    let stateString = this.state.match.states[turnNumber];

    // Remove outer parentheses
    stateString = stateString.trim();
    stateString = stateString.slice(1, stateString.length - 1).trim();

    // Convert into facts, then XML
    let xml = "<state>" + this.toFacts(stateString) + "</state>";
    return xml;
  }

  private toFacts(stateString: string): string {
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

  private getMatchSidebar(): JSX.Element {
    return <MatchInfo match={this.state.match}
              gameMetadata={this.state.gameMetadata}
              turnNumber={this.state.turnNumber}
              setTurnNumber={(turnNumber: number) => this.setTurnNumber(turnNumber)} />;
  }

  private setTurnNumber(turnNumber: number) {
    this.startComputingVizForTurn(turnNumber);
    this.setState({ turnNumber });
  }
}
