import * as React from "react";

// @ts-ignore
import * as mxGraphJs from "mxgraph-js";

import { IMxGraphContext, MxGraphContext } from "../context/MxGraphContext";

const {
  mxRhombus,
  mxEllipse,
  mxConnectionConstraint,
  mxPoint,
  mxRectangleShape,
  mxConstraintHandler,
  mxConnectionHandler,
  mxEdgeHandler,
  mxUtils,
  mxImage,
  mxCellState,
  mxConstants,
} = mxGraphJs;

export class ItemPanel extends React.PureComponent {
  public render(): React.ReactNode {

    return (
      <MxGraphContext.Consumer>{(value: IMxGraphContext) => {
        const { graph } = value;
        if (graph) {
          graph.setConnectable(true);
          graph.connectionHandler.connectImage = new mxImage('images/connector.gif', 10, 10);

          // Disables floating connections (only use with no connect image)
          if (!graph.connectionHandler.connectImage) {
            graph.connectionHandler.isConnectableCell = (cell) => {
              return false;
            };
            mxEdgeHandler.prototype.isConnectableCell = (cell) => {
              return graph.connectionHandler.isConnectableCell(cell);
            };
          }

          graph.getAllConnectionConstraints = function(terminal) {
            if (terminal && this.model.isVertex(terminal.cell)) {
              return [
                new mxConnectionConstraint(new mxPoint(0.5, 0), true),
                new mxConnectionConstraint(new mxPoint(0, 0.5), true),
                new mxConnectionConstraint(new mxPoint(1, 0.5), true),
                new mxConnectionConstraint(new mxPoint(0.5, 1), true),
              ];
            }
            return null;
          };

          // Connect preview
          graph.connectionHandler.createEdgeState = function(me) {
            const edge = graph.createEdge(null, null, null, null, null, "edgeStyle=orthogonalEdgeStyle");
            return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
          };

          var style = graph.getStylesheet().getDefaultEdgeStyle();
          style[mxConstants.STYLE_ROUNDED] = true;
        }

        return (
          <div className="testPanel">
          {this.props.children}
          </div>
        );
      }}
      </MxGraphContext.Consumer>
    );
  }
  public componentDidMount() {
    // Snaps to fixed points
    mxConstraintHandler.prototype.intersects = (icon: any, point: {x: number; y: number}, source, existingEdge) => {
      return (!source || existingEdge) || mxUtils.intersects(icon.bounds, point);
    };

    // Special case: Snaps source of new connections to fixed points
    // Without a connect preview in connectionHandler.createEdgeState mouseMove
    // and getSourcePerimeterPoint should be overriden by setting sourceConstraint
    // sourceConstraint to null in mouseMove and updating it and returning the
    // nearest point (cp) in getSourcePerimeterPoint (see below)
    const mxConnectionHandlerUpdateEdgeState = mxConnectionHandler.prototype.updateEdgeState;
    mxConnectionHandler.prototype.updateEdgeState = function(pt: {x: number; y: number}, _constraint: any): void {
      if (pt && this.previous) {
        const constraints = this.graph.getAllConnectionConstraints(this.previous);
        let nearestConstraint = null;
        let dist = null;
        for (const constraint of constraints) {
          const cp = this.graph.getConnectionPoint(this.previous, constraint);
          if (cp) {
            const tmp = (cp.x - pt.x) * (cp.x - pt.x) + (cp.y - pt.y) * (cp.y - pt.y);
            if (!dist || tmp < dist) {
              nearestConstraint = constraint;
              dist = tmp;
            }
          }
        }
        if (nearestConstraint) {
          this.sourceConstraint = nearestConstraint;
        }

    //     // In case the edge style must be changed during the preview:
    //     // this.edgeState.style['edgeStyle'] = 'orthogonalEdgeStyle';
    //     // And to use the new edge style in the new edge inserted into the graph,
    //     // update the cell style as follows:
    //     //this.edgeState.cell.style = mxUtils.setStyle(this.edgeState.cell.style, 'edgeStyle', this.edgeState.style['edgeStyle']);
      }

      mxConnectionHandlerUpdateEdgeState.apply(this, arguments);
    };
  }
}
