import * as React from "react";

import {
  MxGraphContext,
  IMxGraphContext,
} from "../context/MxGraphContext";

import {
  IMxGraph,
} from "../types/mxGraph"

export class ChangeText extends React.PureComponent {
  constructor(props: {}) {
    super(props);
    this.state = {
      inputValue: "",
    }
  }
  public render(): React.ReactNode {
    return (
      <MxGraphContext.Consumer>{(value: IMxGraphContext) => {
        const {
          graph,
          focusCell,
        } = value;
        if (!graph) {
          return null;
        }
        console.log("render");
        return (
          <div>
            {this.props.children}
            <input type="text" onChange={(e) => {this.handlerChange(e, graph, focusCell[0]);} } value={focusCell && focusCell[0] ? focusCell[0].value : "no focus Cell"} />
          </div>
        );
      }}
      </MxGraphContext.Consumer>
    )
  }

  private handlerChange(e: React.SyntheticEvent, graph: IMxGraph, cell) {
    if (!cell) {
      return ;
    }
    this.setState({
      inputValue: e.target.value,
    });
    graph.model.setValue(cell, e.target.value);
  }
}