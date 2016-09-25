//  / <reference path="../typings/xslt.d.ts" />
import * as React from "react";
import * as _ from "lodash";
import * as $ from "jquery";
import "whatwg-fetch";
// import "xslt";
import { TiltyardMatch, TiltyardGameRawMetadata } from "../types";
import { MatchInfo } from "./MatchInfo";
import { applyXslt } from "../util/xslt";
import { Visualization } from "./Visualization";
// import xsltFoo = require("xslt");

export interface SingleMatchDisplayProps {
  matchId: string;
}

export interface SingleMatchDisplayState {
  match?: TiltyardMatch;
  gameText?: string;
  gameMetadata?: TiltyardGameRawMetadata;
  stylesheet?: string;
}

declare var $xslt: (xml: string, xsl: string, options: any) => any; 
// xslt = require("xslt");

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
        { this.state.match ? this.getMatchXml() : "" }
        { this.state.gameText ? "Game text is " + this.state.gameText : "Loading game..." }
        { this.state.stylesheet
            ? "Stylesheet is " + this.state.stylesheet
            : "Loading stylesheet..."
        }
        <div id="vizPanel">
          { this.state.stylesheet ?
            // new JSX.Element()
            //  toElement(applyXslt($.parseXML("<foo />"), $.parseXML(this.state.stylesheet)))
            <Visualization visualization={applyXslt($.parseXML(this.getMatchXml()), $.parseXML(this.state.stylesheet))} />
              : "" }
        </div>
      </div>
    </div>;
  }

  getMatchXml(): string {
    let states = this.state.match.states;
    let stateString = states[states.length - 1];

    //Remove outer parentheses
    stateString = stateString.trim();
    stateString = stateString.slice(1, stateString.length - 1).trim();

    //Convert into facts
// private static final String renderGdlToXML(Gdl gdl) {
//         String rval = "";
//         if(gdl instanceof GdlConstant) {
//             GdlConstant c = (GdlConstant)gdl;
//             return c.getValue();
//         } else if(gdl instanceof GdlFunction) {
//             GdlFunction f = (GdlFunction)gdl;
//             if(f.getName().toString().equals("true"))
//             {
//                 return "<fact>"+renderGdlToXML(f.get(0))+"</fact>";
//             }
//             else
//             {
//                 rval += "<relation>"+f.getName()+"</relation>";
//                 for(int i=0; i<f.arity(); i++)
//                     rval += "<argument>"+renderGdlToXML(f.get(i))+"</argument>";
//                 return rval;
//             }
//         } else if (gdl instanceof GdlRelation) {
//             GdlRelation relation = (GdlRelation) gdl;
//             if(relation.getName().toString().equals("true"))
//             {
//                 for(int i=0; i<relation.arity(); i++)
//                     rval+="<fact>"+renderGdlToXML(relation.get(i))+"</fact>";
//                 return rval;
//             } else {
//                 rval+="<relation>"+relation.getName()+"</relation>";
//                 for(int i=0; i<relation.arity(); i++)
//                     rval+="<argument>"+renderGdlToXML(relation.get(i))+"</argument>";
//                 return rval;
//             }
//         } else {
//             System.err.println("gdlToXML Error: could not handle "+gdl.toString());
//             return null;
//         }
//     }

    let xml = "<state>" + this.toFacts(stateString) + "</state>";

    //TODO: Convert to xml
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
