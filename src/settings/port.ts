// @ts-ignore
import * as mxGraphJs from "mxgraph-js";

import { IMxGraph, ImxCell, IMxState } from "../types/mxGraph";
const {
  mxGraph,
  mxConstants,
  mxPerimeter,
  mxEdgeHandler,
  mxVertexHandler,
  mxRectangle,
  mxEvent,
  mxGraphHandler,
  mxRectangleShape,
  mxCellMarker,
  mxEventObject,
  mxCellHighlight,
  mxGraphView,
  mxGraphSelectionModel,
  mxShape,
  mxClient,
  mxUtils,
  mxPoint,
} = mxGraphJs;

function _initPortHandler(graph: IMxGraph): void {
  mxShape.prototype.redraw = function () {
    this.updateBoundsFromPoints();

    if (this.visible && this.checkBounds()) {
      console.log(this);
      console.log(this.node);
      this.node.style.visibility = 'visible';
      this.clear();

      if (this.node.nodeName == 'DIV' && (this.isHtmlAllowed() || !mxClient.IS_VML)) {
        this.redrawHtmlShape();
      }
      else {
        this.redrawShape();
      }

      this.updateBoundingBox();
    }
    else {
      this.node.style.visibility = 'hidden';
      this.boundingBox = null;
    }
  };


  mxVertexHandler.prototype.createSelectionShape = function (state) {
    const shape = this.graph.cellRenderer.createShape(state);
    console.log(state.shape);
    shape.style = state.shape.style;
    // const shape = new mxRectangleShape(bounds, this.getSelectionColor(), this.getSelectionColor(), this.getSelectionStrokeWidth());
    shape.isDashed = this.isSelectionDashed();
    shape.isRounded = state.style[mxConstants.STYLE_ROUNDED];
    const isPort = this.graph.isPort(state.cell);

    shape.fill = isPort ? state.style[mxConstants.STYLE_FILLCOLOR] : state.style[mxConstants.STYLE_STROKECOLOR];
    shape.stroke = state.style[mxConstants.STYLE_STROKECOLOR];
    // shape.arcSize = this.state.style[mxConstants.STYLE_ARCSIZE]; not work
    shape.fillOpacity = isPort ? 100 : 20;
    shape.strokeOpacity = 100;
    console.log(shape);
    return shape;
  };
  // tslint:disable
  mxVertexHandler.prototype.init = function () {
    this.graph = this.state.view.graph;
    this.selectionBounds = this.getSelectionBounds(this.state);
    this.bounds = new mxRectangle(this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height);
    this.selectionBorder = this.createSelectionShape(this.state);
    // VML dialect required here for event transparency in IE
    this.selectionBorder.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
    this.selectionBorder.pointerEvents = false;
    this.selectionBorder.init(this.graph.getView().getOverlayPane());
    // console.log(this.selectionBorder);
    // mxEvent.redirectMouseEvents(this.selectionBorder.node, this.graph, this.state);

    if (this.graph.isCellMovable(this.state.cell)) {
      this.selectionBorder.setCursor(mxConstants.CURSOR_MOVABLE_VERTEX);
    }
    // draw preview
    // Adds the sizer handles
    // if (mxGraphHandler.prototype.maxCells <= 0 || this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells) {
    //   var resizable = this.graph.isCellResizable(this.state.cell);
    this.sizers = [];

    // }

    this.customHandles = this.createCustomHandles();
    this.redraw();

    if (this.constrainGroupByChildren) {
      this.updateMinBounds();
    }
  };
  // tslint:enable

  graph.createHandler = (state: IMxState) => {
    let result = null;

    if (state) {
      if (graph.model.isEdge(state.cell)) {
        const source = state.getVisibleTerminalState(true);
        const target = state.getVisibleTerminalState(false);
        const geo = graph.getCellGeometry(state.cell);

        const edgeStyle = graph.view.getEdgeStyle(state, (geo != null) ? geo.points : null, source, target);
        result = graph.createEdgeHandler(state, edgeStyle);
      }
      else if (graph.isPort(state.cell)) {
        result = graph.createVertexHandler(state);
      }
      else {
        result = graph.createVertexHandler(state);
      }
    }

    return result;
  };
}

function setPortStyle(graph: IMxGraph) {
  const style = new Object();
  // style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_IMAGE;
  style[mxConstants.STYLE_SHAPE] = mxConstants.SHAPE_ELLIPSE;
  style[mxConstants.STYLE_PERIMETER] = mxConstants.PERIMETER_ELLIPSE;
  style[mxConstants.STYLE_ROUNDED] = true;
  style[mxConstants.STYLE_FONTCOLOR] = '#774400';
  style[mxConstants.STYLE_FILLCOLOR] = "white";
  // style[mxConstants.STYLE_PERIMETER] = mxPerimeter.RectanglePerimeter;
  // style[mxConstants.STYLE_PERIMETER_SPACING] = '6';
  // style[mxConstants.STYLE_ALIGN] = mxConstants.ALIGN_LEFT;
  // style[mxConstants.STYLE_VERTICAL_ALIGN] = mxConstants.ALIGN_MIDDLE;
  // style[mxConstants.STYLE_FONTSIZE] = '10';
  // style[mxConstants.STYLE_FONTSTYLE] = 2;
  // style[mxConstants.STYLE_IMAGE_WIDTH] = '16';
  // style[mxConstants.STYLE_IMAGE_HEIGHT] = '16';
  graph.getStylesheet().putCellStyle("port", style);
}

function setPortValidationStyle(graph: IMxGraph) {
  mxCellMarker.prototype.getMarkerColor = function (evt, state, isValid) {
    return (isValid) ? "#1565c0" : "red";
  };
  mxCellHighlight.prototype.repaint = function () {
    if (this.state != null && this.shape != null) {
      if (this.graph.model.isEdge(this.state.cell)) {
        this.shape.points = this.state.absolutePoints;
      }
      else {
        this.shape.bounds = new mxRectangle(this.state.x - this.spacing, this.state.y - this.spacing,
          this.state.width + 2 * this.spacing, this.state.height + 2 * this.spacing);
        this.shape.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || '0');
      }

      // Uses cursor from shape in highlight
      if (this.state.shape != null) {
        this.shape.setCursor(this.state.shape.getCursor());
      }

      // Workaround for event transparency in VML with transparent color
      // is to use a non-transparent color with near zero opacity
      if (mxClient.IS_QUIRKS || document.documentMode == 8) {
        if (this.shape.stroke == 'transparent') {
          // KNOWN: Quirks mode does not seem to catch events if
          // we do not force an update of the DOM via a change such
          // as mxLog.debug. Since IE6 is EOL we do not add a fix.
          this.shape.stroke = 'white';
          this.shape.opacity = 1;
        }
        else {
          this.shape.opacity = this.opacity;
        }
      }

      this.shape.redraw();
    }
  };

  mxUtils.convertPoint = function(container, x, y) {
		var origin = mxUtils.getScrollOrigin(container);
		var offset = mxUtils.getOffset(container);

		// offset.x -= origin.x;
		// offset.y -= origin.y;
		
		return new mxPoint(x - offset.x, y - offset.y);
	}

  mxCellHighlight.prototype.createShape = function () {
    var shape = this.graph.cellRenderer.createShape(this.state);
    shape.svgStrokeTolerance = this.graph.tolerance;
    shape.scale = this.state.view.scale;
    // shape.outline = true;
    shape.points = this.state.absolutePoints;
    shape.apply(this.state);
    shape.strokewidth = this.spacing / this.state.view.scale / this.state.view.scale;
    shape.arrowStrokewidth = this.spacing;
    console.log(shape);
    shape.stroke = this.highlightColor;
    shape.opacity = 50;
    shape.isDashed = this.dashed;
    shape.isShadow = false;
    shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
    shape.init(this.graph.getView().getOverlayPane()); // make node
    mxEvent.redirectMouseEvents(shape.node, this.graph, this.state); // fire connection event
    // if (this.graph.dialect != mxConstants.DIALECT_SVG) {
    //   shape.pointerEvents = false;
    // }
    // else {
    //   shape.svgPointerEvents = 'stroke';
    // }

    return shape;
  };

}

function setHospot(graph: IMxGraph) {
  mxCellMarker.prototype.intersects = function (state, me) {
    if (this.hotspotEnabled) {
      return mxUtils.intersectsHotspot(state, me.getGraphX(), me.getGraphY(),
        10, mxConstants.MIN_HOTSPOT_SIZE,
        mxConstants.MAX_HOTSPOT_SIZE);
    }

    return true;
  };
}

// tslint:disable-next-line: export-name
export function initPort(graph: IMxGraph) {

  _initPortHandler(graph);
  // setPortStyle(graph);
  setPortValidationStyle(graph);
  setHospot(graph);
  graph.disconnectOnMove = false;
  graph.foldingEnabled = false;
  graph.cellsResizable = false;
  graph.extendParents = false;

  graph.getLabel = function (cell: ImxCell) {
    const label = mxGraph.prototype.getLabel.apply(this, arguments); // "supercall"
    if (this.isCellLocked(cell)) { return ""; }
    else if (this.isCellCollapsed(cell)) {
      const index = label.indexOf("</h1>");
      if (index > 0) { label = label.substring(0, index + 5); }
    }
    return label;
  }

  graph.isPort = (cell) => {
    const geo = graph.getCellGeometry(cell);
    return geo ? graph.getModel().isVertex(cell) && geo.relative : false;
  };

  graph.setTooltips(true);
  graph.getTooltipForCell = function (cell) {
    if (graph.getModel().isEdge(cell)) {
      return graph.convertValueToString(this.model.getTerminal(cell, true)) +
        graph.convertValueToString(this.model.getTerminal(cell, false));
    }
    return mxGraph.prototype.getTooltipForCell.apply(this, arguments);
  };

  // Removes the folding icon and disables any folding
  graph.isCellFoldable = function (cell) {
    return false;
  };
  graph.view.updateFixedTerminalPoint = function (edge, terminal, source, constraint) {
    mxGraphView.prototype.updateFixedTerminalPoint.apply(this, arguments);

    var pts = edge.absolutePoints;
    var pt = pts[(source) ? 0 : pts.length - 1];

    if (terminal != null && pt == null && this.getPerimeterFunction(terminal) == null) {
      edge.setAbsoluteTerminalPoint(new mxPoint(this.getRoutingCenterX(terminal),
        this.getRoutingCenterY(terminal)), source)
    }
  };

  if (!graph.connectionHandler.connectImage) {
    graph.connectionHandler.isConnectableCell = (cell) => {
      return graph.isPort(cell);
    };
    mxEdgeHandler.prototype.isConnectableCell = (cell) => {
      return graph.connectionHandler.isConnectableCell(cell);
    };
  }

  mxGraphSelectionModel.prototype.setCell = function (cell) {
    if (cell != null) {
      const cells = [cell];
      if (cell.children) {
        cell.children.forEach((port) => {
          if (graph.isPort(port)) {
            cells.push(port);
          }
        })
      }
      this.setCells(cells);
    }
  };
}
