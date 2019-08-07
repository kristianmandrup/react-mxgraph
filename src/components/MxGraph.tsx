import * as React from "react";

// @ts-ignore
import * as mxGraphJs from "mxgraph-js";

// import {
//   _extractGraphModelFromEvent,
//   _pasteText,
// } from "../utils/Copy";
import {
  ClipboardContext, IClipboardContext,
} from "../context/ClipboardContext";
import {
  MxGraphContext
} from "../context/MxGraphContext";
import { IMxActions } from "../types/action";
import { IMxEventObject, IMxGraph, IMxUndoManager, ImxCell, IMxShape, IMxConnectionConstraint } from "../types/mxGraph";

const {
  mxClient,
  mxUtils,
  mxEvent,
  mxGraphModel,
  mxGeometry,
  mxPoint,
  mxTransient,
  mxObjectIdentity,
  mxUndoManager,
  mxCellTracker,
  mxConstants,
  mxVertexHandler,
  mxGraphHandler,
  mxRectangle,
  mxConstraintHandler,
  mxConnectionHandler,
  mxConnectionConstraint,
  mxImage,
  mxCellState,
  mxRectangleShape,
  mxEdgeHandler,
  mxEllipse,
  mxCylinder,
  mxCellRenderer,
  mxGraph,
  mxShape,
} = mxGraphJs;

window.mxGeometry = mxGeometry;
window.mxGraphModel = mxGraphModel;
window.mxPoint = mxPoint;

interface IState {
  graph?: IMxGraph;
}

export class MxGraph extends React.PureComponent<{}, IState> {
  public static contextType = ClipboardContext;
  private readonly undoManager: IMxUndoManager;
  private mouseX: number;
  private mouseY: number;
  private action: IMxActions | undefined;

  constructor(props: {}) {
    super(props);
    this.state = {
      graph: undefined,
    };
    this.mouseX = 0;
    this.mouseY = 0;

    this.undoManager = new mxUndoManager();
  }

  public setGraph = (graph: IMxGraph) => {
    if (this.state.graph) {
      return;
    }
    this.initStyle(graph);

    var mxConstraintHandlerUpdate = mxConstraintHandler.prototype.update;
		mxConstraintHandler.prototype.update = function(me, source)
		{
			if (this.isKeepFocusEvent(me) || !mxEvent.isAltDown(me.getEvent()))
			{
				mxConstraintHandlerUpdate.apply(this, arguments);
			}
			else
			{
				this.reset();
			}
		};

    mxGraph.prototype.getConnectionPoint = function(vertex, constraint)
{
	var point = null;
	
	if (vertex != null && constraint.point != null)
	{
		var bounds = this.view.getPerimeterBounds(vertex);
        var cx = new mxPoint(bounds.getCenterX(), bounds.getCenterY());
		var direction = vertex.style[mxConstants.STYLE_DIRECTION];
		var r1 = 0;
		
		// Bounds need to be rotated by 90 degrees for further computation
		if (direction != null)
		{
			if (direction == mxConstants.DIRECTION_NORTH)
			{
				r1 += 270;
			}
			else if (direction == mxConstants.DIRECTION_WEST)
			{
				r1 += 180;
			}
			else if (direction == mxConstants.DIRECTION_SOUTH)
			{
				r1 += 90;
			}

			// Bounds need to be rotated by 90 degrees for further computation
			if (direction == mxConstants.DIRECTION_NORTH || direction == mxConstants.DIRECTION_SOUTH)
			{
				bounds.rotate90();
			}
		}

		if (constraint.point != null)
		{
			var sx = 1;
			var sy = 1;
			var dx = 0;
			var dy = 0;
			
			// LATER: Add flipping support for image shapes
			if (this.getModel().isVertex(vertex.cell))
			{
				var flipH = vertex.style[mxConstants.STYLE_FLIPH];
				var flipV = vertex.style[mxConstants.STYLE_FLIPV];
				
				// Legacy support for stencilFlipH/V
				if (vertex.shape != null && vertex.shape.stencil != null)
				{
					flipH = mxUtils.getValue(vertex.style, 'stencilFlipH', 0) == 1 || flipH;
					flipV = mxUtils.getValue(vertex.style, 'stencilFlipV', 0) == 1 || flipV;
				}
				
				if (direction == mxConstants.DIRECTION_NORTH || direction == mxConstants.DIRECTION_SOUTH)
				{
					var tmp = flipH;
					flipH = flipV;
					flipV = tmp;
				}
				
				if (flipH)
				{
					sx = -1;
					dx = -bounds.width;
				}
				
				if (flipV)
				{
					sy = -1;
					dy = -bounds.height ;
				}
			}
			
			point = new mxPoint(bounds.x + constraint.point.x * bounds.width * sx - dx,
					bounds.y + constraint.point.y * bounds.height * sy - dy);
		}
		
		// Rotation for direction before projection on perimeter
		var r2 = vertex.style[mxConstants.STYLE_ROTATION] || 0;
		
		if (constraint.perimeter)
		{
			if (r1 != 0 && point != null)
			{
				// Only 90 degrees steps possible here so no trig needed
				var cos = 0;
				var sin = 0;
				
				if (r1 == 90)
				{
					sin = 1;
				}
				else if (r1 == 180)
				{
					cos = -1;
				}
				else if (r1 == 270)
				{
					sin = -1;
				}
				
		        point = mxUtils.getRotatedPoint(point, cos, sin, cx);
			}
	
			if (point != null && constraint.perimeter)
			{
				point = this.view.getPerimeterPoint(vertex, point, false);
			}
		}
		else
		{
			r2 += r1;
		}

		// Generic rotation after projection on perimeter
		if (r2 != 0 && point != null)
		{
	        var rad = mxUtils.toRadians(r2);
	        var cos = Math.cos(rad);
	        var sin = Math.sin(rad);
	        
	        point = mxUtils.getRotatedPoint(point, cos, sin, cx);
		}
	}
	
	if (point != null)
	{
		point.x = Math.round(point.x);
		point.y = Math.round(point.y);
	}
	
	return point;
};
    // function mxConnectionConstraint(point, perimeter, name, dx, dy) {
    //   this.point = point;
    //   this.perimeter = (perimeter != null) ? perimeter : true;
    //   this.name = name;
    //   this.dx = dx ? dx : 0;
    //   this.dy = dy ? dy : 0;
    // };
    // mxGraph.prototype.getConnectionPoint = function(vertex, constraint)
    // {
    //   var point = null;
      
    //   if (vertex != null && constraint.point != null)
    //   {
    //     var bounds = this.view.getPerimeterBounds(vertex);
    //         var cx = new mxPoint(bounds.getCenterX(), bounds.getCenterY());
    //     var direction = vertex.style[mxConstants.STYLE_DIRECTION];
    //     var r1 = 0;
        
    //     // Bounds need to be rotated by 90 degrees for further computation
    //     if (direction != null && mxUtils.getValue(vertex.style,
    //       mxConstants.STYLE_ANCHOR_POINT_DIRECTION, 1) == 1)
    //     {
    //       if (direction == mxConstants.DIRECTION_NORTH)
    //       {
    //         r1 += 270;
    //       }
    //       else if (direction == mxConstants.DIRECTION_WEST)
    //       {
    //         r1 += 180;
    //       }
    //       else if (direction == mxConstants.DIRECTION_SOUTH)
    //       {
    //         r1 += 90;
    //       }
    
    //       // Bounds need to be rotated by 90 degrees for further computation
    //       if (direction == mxConstants.DIRECTION_NORTH ||
    //         direction == mxConstants.DIRECTION_SOUTH)
    //       {
    //         bounds.rotate90();
    //       }
    //     }
    
    //     var scale = this.view.scale;
    //     point = new mxPoint(bounds.x + constraint.point.x * bounds.width + constraint.dx * scale,
    //         bounds.y + constraint.point.y * bounds.height + constraint.dy * scale);
        
    //     // Rotation for direction before projection on perimeter
    //     var r2 = vertex.style[mxConstants.STYLE_ROTATION] || 0;
        
    //     if (constraint.perimeter)
    //     {
    //       if (r1 != 0)
    //       {
    //         // Only 90 degrees steps possible here so no trig needed
    //         var cos = 0;
    //         var sin = 0;
            
    //         if (r1 == 90)
    //         {
    //           sin = 1;
    //         }
    //         else if (r1 == 180)
    //         {
    //           cos = -1;
    //         }
    //         else if (r1 == 270)
    //         {
    //           sin = -1;
    //         }
            
    //             point = mxUtils.getRotatedPoint(point, cos, sin, cx);
    //       }
      
    //       point = this.view.getPerimeterPoint(vertex, point, false);
    //     }
    //     else
    //     {
    //       r2 += r1;
          
    //       if (this.getModel().isVertex(vertex.cell))
    //       {
    //         var flipH = vertex.style[mxConstants.STYLE_FLIPH] == 1;
    //         var flipV = vertex.style[mxConstants.STYLE_FLIPV] == 1;
            
    //         // Legacy support for stencilFlipH/V
    //         if (vertex.shape != null && vertex.shape.stencil != null)
    //         {
    //           flipH = (mxUtils.getValue(vertex.style, 'stencilFlipH', 0) == 1) || flipH;
    //           flipV = (mxUtils.getValue(vertex.style, 'stencilFlipV', 0) == 1) || flipV;
    //         }
            
    //         if (flipH)
    //         {
    //           point.x = 2 * bounds.getCenterX() - point.x;
    //         }
            
    //         if (flipV)
    //         {
    //           point.y = 2 * bounds.getCenterY() - point.y;
    //         }
    //       }
    //     }
    
    //     // Generic rotation after projection on perimeter
    //     if (r2 != 0 && point != null)
    //     {
    //           var rad = mxUtils.toRadians(r2);
    //           var cos = Math.cos(rad);
    //           var sin = Math.sin(rad);
              
    //           point = mxUtils.getRotatedPoint(point, cos, sin, cx);
    //     }
    //   }
      
    //   if (point != null)
    //   {
    //     point.x = Math.round(point.x);
    //     point.y = Math.round(point.y);
    //   }
    
    //   return point;
    // };
    this.initVertexHandle(graph);
    this.initEdgeHandle(graph);

    this.initConnection(graph);

    this.registerShape(graph);
    // initialize action first
    // tslint:disable-next-line: deprecation
    this.action = this.initAction(graph, this.context);

    this.addCopyEvent(graph);
    this.addUndoEvent(graph);

    // const highlight = new mxCellTracker(graph, "#66ccff");
    // this.addHoverEvent(graph);

    this.setState({
      graph,
    });
  }

  public registerShape = (graph: IMxGraph) => {
    mxGraph.prototype.tolerance = 8;
    // function CollateShape() {
    //   mxEllipse.call(this);
    // };
    // mxUtils.extend(CollateShape, mxEllipse);
    function CollateShape() {
      mxCylinder.call(this);
    };
    mxUtils.extend(CollateShape, mxCylinder);
    CollateShape.prototype.size = 20;
    const tan30 = Math.tan(mxUtils.toRadians(30));
    const tan30Dx = (0.5 - tan30) / 2;
    CollateShape.prototype.redrawPath = function (path, x, y, w, h, isForeground) {
      var m = Math.min(w, h / (0.5 + tan30));

      if (isForeground) {
        path.moveTo(0, 0.25 * m);
        path.lineTo(0.5 * m, (0.5 - tan30Dx) * m);
        path.lineTo(m, 0.25 * m);
        path.moveTo(0.5 * m, (0.5 - tan30Dx) * m);
        path.lineTo(0.5 * m, (1 - tan30Dx) * m);
        path.end();
      }
      else {
        path.translate((w - m) / 2, (h - m) / 2);
        path.moveTo(0, 0.25 * m);
        path.lineTo(0.5 * m, m * tan30Dx);
        path.lineTo(m, 0.25 * m);
        path.lineTo(m, 0.75 * m);
        path.lineTo(0.5 * m, (1 - tan30Dx) * m);
        path.lineTo(0, 0.75 * m);
        path.close();
        path.end();
      }
    };

    mxCellRenderer.registerShape('collate', CollateShape);

    // Defines connection points for all shapes
    CollateShape.prototype.constraints = [];

    CollateShape.prototype.getConstraints = function (style, w, h) {
      var constr = [];
      var tan30 = Math.tan(mxUtils.toRadians(30));
      var tan30Dx = (0.5 - tan30) / 2;
      var m = Math.min(w, h / (0.5 + tan30));
      var dx = (w - m) / 2;
      var dy = (h - m) / 2;

      constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, dy + 0.25 * m));
      constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx + 0.5 * m, dy + m * tan30Dx));
      constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx + m, dy + 0.25 * m));
      constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx + m, dy + 0.75 * m));
      constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx + 0.5 * m, dy + (1 - tan30Dx) * m));
      constr.push(new mxConnectionConstraint(new mxPoint(0, 0), false, null, dx, dy + 0.75 * m));
      return (constr);
    };
  }

  public initStyle = (graph: IMxGraph) => {
    const style = graph.getStylesheet().getDefaultEdgeStyle();
    style.strokeColor = "#1685a9";
    style.fontColor = "#000000";
    style.fontStyle = "0";
    style.fontStyle = "0";
    // style.startSize = "8";
    // style.endSize = "8";
    // style[mxConstants.STYLE_ROUNDED] = true;
    style[mxConstants.STYLE_CURVED] = "1";
  }
  // override
  public initVertexHandle = (graph: IMxGraph) => {
    mxConstants.VERTEX_SELECTION_COLOR = "#003472";
    mxConstants.VERTEX_SELECTION_STROKEWIDTH = "2";
    mxConstants.EDGE_SELECTION_COLOR = "#6b6882";
    mxConstants.EDGE_SELECTION_STROKEWIDTH = "1";
    // tslint:disable-next-line: no-function-expression
    mxVertexHandler.prototype.getSelectionColor = function (): string {
      return mxConstants.VERTEX_SELECTION_COLOR;
    };
    // tslint:disable-next-line: no-function-expression
    mxVertexHandler.prototype.getSelectionStrokeWidth = function (): string {
      return mxConstants.VERTEX_SELECTION_STROKEWIDTH;
    };
    // tslint:disable-next-line: no-function-expression
    mxVertexHandler.prototype.isSelectionDashed = function (): string {
      return mxConstants.VERTEX_SELECTION_DASHED;
    };
    mxVertexHandler.prototype.createSelectionShape = function (bounds: any): IMxShape {
      const shape = new mxRectangleShape(bounds, null, this.getSelectionColor()); // bounds, fill, stroke, strokewidth
      shape.strokewidth = this.getSelectionStrokeWidth();
      shape.isDashed = this.isSelectionDashed();
      return shape;
    };

    mxVertexHandler.prototype.init = function (): void {
      this.graph = this.state.view.graph;
      this.selectionBounds = this.getSelectionBounds(this.state);
      this.bounds = new mxRectangle(this.selectionBounds.x, this.selectionBounds.y, this.selectionBounds.width, this.selectionBounds.height);
      this.selectionBorder = this.createSelectionShape(this.bounds);
      // VML dialect required here for event transparency in IE
      this.selectionBorder.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
      this.selectionBorder.pointerEvents = false;
      this.selectionBorder.rotation = Number(this.state.style[mxConstants.STYLE_ROTATION] || "0");
      this.selectionBorder.init(this.graph.getView().getOverlayPane());
      mxEvent.redirectMouseEvents(this.selectionBorder.node, this.graph, this.state);

      if (this.graph.isCellMovable(this.state.cell)) {
        this.selectionBorder.setCursor(mxConstants.CURSOR_MOVABLE_VERTEX);
      }

      this.customHandles = this.createCustomHandles();
      this.redraw();

      if (this.constrainGroupByChildren) {
        this.updateMinBounds();
      }
    };

  }
  // override
  public initEdgeHandle = (graph: IMxGraph) => {
    mxEdgeHandler.prototype.isHandleVisible = function (index) {
      return false;
    }

    // tslint:disable-next-line: cyclomatic-complexity
    mxEdgeHandler.prototype.init = function () {
      this.graph = this.state.view.graph;
      this.marker = this.createMarker();
      this.constraintHandler = new mxConstraintHandler(this.graph);

      // Clones the original points from the cell
      // and makes sure at least one point exists
      this.points = [];

      // Uses the absolute points of the state
      // for the initial configuration and preview
      // this.abspoints = this.getSelectionPoints(this.state);
      this.shape = this.createSelectionShape(this.abspoints);
      this.shape.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ?
        mxConstants.DIALECT_MIXEDHTML : mxConstants.DIALECT_SVG;
      this.shape.init(this.graph.getView().getOverlayPane());
      this.shape.pointerEvents = false;
      this.shape.setCursor(mxConstants.CURSOR_MOVABLE_EDGE);
      mxEvent.redirectMouseEvents(this.shape.node, this.graph, this.state);

      // Updates preferHtml
      this.preferHtml = this.state.text != null &&
        this.state.text.node.parentNode == this.graph.container;

      if (!this.preferHtml) {
        // Checks source terminal
        const sourceState = this.state.getVisibleTerminalState(true);

        if (sourceState != null) {
          this.preferHtml = sourceState.text != null &&
            sourceState.text.node.parentNode == this.graph.container;
        }

        if (!this.preferHtml) {
          // Checks target terminal
          const targetState = this.state.getVisibleTerminalState(false);

          if (targetState != null) {
            this.preferHtml = targetState.text != null &&
              targetState.text.node.parentNode == this.graph.container;
          }
        }
      }

      // Adds highlight for parent group
      if (this.parentHighlightEnabled) {
        const parent = this.graph.model.getParent(this.state.cell);

        if (this.graph.model.isVertex(parent)) {
          const pstate = this.graph.view.getState(parent);

          if (pstate != null) {
            this.parentHighlight = this.createParentHighlightShape(pstate);
            // VML dialect required here for event transparency in IE
            this.parentHighlight.dialect = (this.graph.dialect != mxConstants.DIALECT_SVG) ? mxConstants.DIALECT_VML : mxConstants.DIALECT_SVG;
            this.parentHighlight.pointerEvents = false;
            this.parentHighlight.rotation = Number(pstate.style[mxConstants.STYLE_ROTATION] || '0');
            this.parentHighlight.init(this.graph.getView().getOverlayPane());
          }
        }
      }

      // Creates bends for the non-routed absolute points
      // or bends that don't correspond to points
      // if (this.graph.getSelectionCount() < mxGraphHandler.prototype.maxCells ||
      //   mxGraphHandler.prototype.maxCells <= 0) {
      //   this.bends = this.createBends();

      //   if (this.isVirtualBendsEnabled()) {
      //     this.virtualBends = this.createVirtualBends();
      //   }
      // }

      // Adds a rectangular handle for the label position
      this.label = new mxPoint(this.state.absoluteOffset.x, this.state.absoluteOffset.y);
      this.labelShape = this.createLabelHandleShape();
      this.initBend(this.labelShape);
      this.labelShape.setCursor(mxConstants.CURSOR_LABEL_HANDLE);

      this.customHandles = this.createCustomHandles();

      this.redraw();
    };
  }

  public initConnection = (graph: IMxGraph) => {
    function mxConnectionConstraint(point, perimeter, name, dx, dy) {
      this.point = point;
      this.perimeter = (perimeter != null) ? perimeter : true;
      this.name = name;
      this.dx = dx ? dx : 0;
      this.dy = dy ? dy : 0;
    };
    // Snaps to fixed points
    mxConstraintHandler.prototype.intersects = (icon: any, point: { x: number; y: number }, source, existingEdge) => {
      return (!source || existingEdge) || mxUtils.intersects(icon.bounds, point);
    };
    // Hook for custom constraints
    mxShape.prototype.getConstraints = function (style, w, h) {
      return null;
    };
    mxEllipse.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0, 0), true), new mxConnectionConstraint(new mxPoint(1, 0), true),
      new mxConnectionConstraint(new mxPoint(0, 1), true), new mxConnectionConstraint(new mxPoint(1, 1), true),
      new mxConnectionConstraint(new mxPoint(0.5, 0), true), new mxConnectionConstraint(new mxPoint(0.5, 1), true),
    new mxConnectionConstraint(new mxPoint(0, 0.5), true), new mxConnectionConstraint(new mxPoint(1, 0.5))];
    mxRectangleShape.prototype.constraints = [new mxConnectionConstraint(new mxPoint(0.25, 0), true),
    new mxConnectionConstraint(new mxPoint(0.5, 0), true),
    new mxConnectionConstraint(new mxPoint(0.75, 0), true),
    new mxConnectionConstraint(new mxPoint(0, 0.25), true),
    new mxConnectionConstraint(new mxPoint(0, 0.5), true),
    new mxConnectionConstraint(new mxPoint(0, 0.75), true),
    new mxConnectionConstraint(new mxPoint(1, 0.25), true),
    new mxConnectionConstraint(new mxPoint(1, 0.5), true),
    new mxConnectionConstraint(new mxPoint(1, 0.75), true),
    new mxConnectionConstraint(new mxPoint(0.25, 1), true),
    new mxConnectionConstraint(new mxPoint(0.5, 1), true),
    new mxConnectionConstraint(new mxPoint(0.75, 1), true)];
    const mxConnectionHandlerUpdateEdgeState = mxConnectionHandler.prototype.updateEdgeState;
    mxConnectionHandler.prototype.updateEdgeState = function (pt: { x: number; y: number }, _constraint: any): void {
      // if (pt && this.previous) {
      //   const constraints = this.graph.getAllConnectionConstraints(this.previous);
      //   let nearestConstraint = null;
      //   let dist = null;
      //   for (const constraint of constraints) {
      //     const cp = this.graph.getConnectionPoint(this.previous, constraint);
      //     if (cp) {
      //       const tmp = (cp.x - pt.x) * (cp.x - pt.x) + (cp.y - pt.y) * (cp.y - pt.y);
      //       if (!dist || tmp < dist) {
      //         nearestConstraint = constraint;
      //         dist = tmp;
      //       }
      //     }
      //   }
      //   if (nearestConstraint) {
      //     this.sourceConstraint = nearestConstraint;
      //   }

      //   // In case the edge style must be changed during the preview:
      //   this.edgeState.style['edgeStyle'] = 'orthogonalEdgeStyle';
      //   this.edgeState.style[mxConstants.STYLE_CURVED] = '0';
      //   console.log(this.edgeState.style);
      //   // And to use the new edge style in the new edge inserted into the graph,
      //   // update the cell style as follows:
      //   //this.edgeState.cell.style = mxUtils.setStyle(this.edgeState.cell.style, 'edgeStyle', this.edgeState.style['edgeStyle']);
      // }

      mxConnectionHandlerUpdateEdgeState.apply(this, arguments);
    };
    graph.setConnectable(true);
    // SET Central Img
    // graph.connectionHandler.connectImage = new mxImage('images/connector.gif', 10, 10);

    // Disables floating connections (only use with no connect image)
    if (!graph.connectionHandler.connectImage) {
      graph.connectionHandler.isConnectableCell = (cell) => {
        return false;
      };
      mxEdgeHandler.prototype.isConnectableCell = (cell) => {
        return graph.connectionHandler.isConnectableCell(cell);
      };
    }

    // tslint:disable-next-line: cyclomatic-complexity max-func-body-length
    graph.getAllConnectionConstraints = (terminal, source): IMxConnectionConstraint[] => {
      if (terminal) {
        let constraints = mxUtils.getValue(terminal.style, "points", null);
        if (constraints) {
          const result = [];
          try {
            const c = JSON.parse(constraints);
            for (const tmp of c) {
              result.push(new mxConnectionConstraint(new mxPoint(tmp[0], tmp[1]), (tmp.length > 2) ? tmp[2] != '0' : true,
                null, (tmp.length > 3) ? tmp[3] : 0, (tmp.length > 4) ? tmp[4] : 0));
            }
          } catch (e) {
            //ignore
          }
          return result;
        } else if (terminal.shape && terminal.shape.bounds != null) {
          const dir = terminal.shape.direction;
          const bounds = terminal.shape.bounds;
          const scale = terminal.shape.scale;
          let w = bounds.width / scale;
          let h = bounds.height / scale;

          if (dir === mxConstants.DIRECTION_NORTH || dir === mxConstants.DIRECTION_SOUTH) {
            [w, h] = [h, w];
          }

          constraints = terminal.shape.getConstraints(terminal.style, w, h);
          if (constraints) {
            return constraints;
          } else if (terminal.shape.stencil && terminal.shape.stencil.constraints) {
            return terminal.shape.stencil.constraints;
          } else if (terminal.shape.constraints) {
            return terminal.shape.constraints;
          }
        }
      }
      return null;
    };

    // Connect preview
    graph.connectionHandler.createEdgeState = function (me) {
      const edge = graph.createEdge(null, null, null, null, null, "edgeStyle=orthogonalEdgeStyle");
      return new mxCellState(this.graph.view, edge, this.graph.getCellStyle(edge));
    };

  }

  public addUndoEvent = (graph: IMxGraph) => {
    const listener = (_sender, evt: IMxEventObject) => {
      this.undoManager.undoableEditHappened(evt.getProperty("edit"));
    };
    graph.getModel()
      .addListener(mxEvent.UNDO, listener);
    graph.getView()
      .addListener(mxEvent.UNDO, listener);
  }
  // tslint:disable-next-line: max-func-body-length
  public addCopyEvent = (graph: IMxGraph) => { // , textInput: HTMLTextAreaElement, copy: ICopy) => {
    // tslint:disable-next-line: deprecation
    const { copy, textInput } = this.context;
    copy.gs = graph.gridSize;
    this.initTextInput(textInput);

    graph.container.onmousemove = (evt) => {
      this.mouseX = evt.offsetX;
      this.mouseY = evt.offsetY;
    };

    // tslint:disable-next-line: cyclomatic-complexity
    mxEvent.addListener(document, "keydown", (evt: KeyboardEvent) => {
      const source = mxEvent.getSource(evt);
      if (graph.isEnabled() && !graph.isMouseDown && !graph.isEditing() && source.nodeName !== "INPUT") {
        // tslint:disable-next-line: deprecation
        if (evt.keyCode === 224 /* FF */ || (!mxClient.IS_MAC && evt.keyCode === 17 /* Control */) || (mxClient.IS_MAC && evt.keyCode === 91 /* Meta */)) {
          // tslint:disable-next-line: deprecation
          this.context.beforeUsingClipboard(graph, copy, textInput);
        }
        // tslint:disable-next-line: deprecation
        if (evt.keyCode === 8/*Backspace*/) {
          if (this.action) { this.action.deleteCell.func(); }
        }
      }
    });

    mxEvent.addListener(document, "keyup", (evt: KeyboardEvent) => {
      // tslint:disable-next-line: deprecation
      if (copy.restoreFocus && (evt.keyCode === 224 || evt.keyCode === 17 || evt.keyCode === 91)) {
        // tslint:disable-next-line: deprecation
        this.context.afterUsingClipboard(graph, copy, textInput);
      }
    });

    mxEvent.addListener(textInput, "copy", mxUtils.bind(this, (_evt: ClipboardEvent) => {
      // tslint:disable-next-line: deprecation
      this.context.copyFunc(graph, copy, textInput);
    }));

    mxEvent.addListener(textInput, "cut", mxUtils.bind(this, (_evt: ClipboardEvent) => {
      // tslint:disable-next-line: deprecation
      this.context.cutFunc(graph, copy, textInput);
    }));

    mxEvent.addListener(textInput, "paste", (evt: ClipboardEvent) => {
      // tslint:disable-next-line: deprecation
      this.context.pasteFunc(evt, graph, copy, textInput, this.mouseX, this.mouseY);
    });

  }

  public addHoverEvent = (graph: IMxGraph) => {
    function updateStyle(state, hover) {
      // Sets rounded style for both cases since the rounded style
      // is not set in the default style and is therefore inherited
      // once it is set, whereas the above overrides the default value

      state.style[mxConstants.STYLE_ROUNDED] = (hover) ? "1" :
        (state.style[mxConstants.STYLE_ROUNDED]) ? state.style[mxConstants.STYLE_ROUNDED] : "0";
      state.style[mxConstants.STYLE_STROKEWIDTH] = (hover) ? "4" : "1";
      state.style[mxConstants.STYLE_FONTSTYLE] = (hover) ? mxConstants.FONT_BOLD : "0";
    };
    graph.addMouseListener(
      {
        currentState: null,
        previousStyle: null,
        mouseDown(_sender, me): void {
          if (this.currentState) {
            console.log(me.getCell());
            this.dragLeave(me.getEvent(), this.currentState);
            this.currentState = null;
          }
        },
        mouseMove(_sender, me): void {
          if (this.currentState && me.getState() === this.currentState) {
            return;
          }
          let tmp = graph.view.getState(me.getCell());

          // Ignores everything but vertices
          if (graph.isMouseDown || (tmp && !
            // tslint:disable-next-line: newline-per-chained-call
            graph.getModel().isVertex(tmp.cell) && !graph.getModel().isEdge(tmp.cell))) {
            tmp = null;
          }

          if (tmp !== this.currentState) {
            if (this.currentState) {
              this.dragLeave(me.getEvent(), this.currentState);
            }

            this.currentState = tmp;

            if (this.currentState) {
              this.dragEnter(me.getEvent(), this.currentState);
            }
          }
        },
        // tslint:disable-next-line: no-empty
        mouseUp(_sender, _me): void { },
        dragEnter(_evt, state): void {
          if (state) {
            this.previousStyle = state.style;
            state.style = mxUtils.clone(state.style);
            updateStyle(state, true);
            state.shape.apply(state);
            state.shape.redraw();

            if (state.text) {
              state.text.apply(state);
              state.text.redraw();
            }
          }
        },
        dragLeave(_evt, state): void {
          if (state) {
            state.style = this.previousStyle;
            updateStyle(state, false);
            state.shape.apply(state);
            state.shape.redraw();

            if (state.text) {
              state.text.apply(state);
              state.text.redraw();
            }
          }
        }
      });
  }

  public componentWillMount(): void {
    if (!mxClient.isBrowserSupported()) {
      mxUtils.error("Browser is not supported!", 200, false);
    }
  }

  public render(): React.ReactNode {

    return (
      <div className="graph">
        <MxGraphContext.Provider
          value={{
            graph: this.state.graph,
            setGraph: this.setGraph,
            action: this.action,
          }}
        >
          {this.props.children}
        </MxGraphContext.Provider>
      </div>
    );
  }

  private readonly initTextInput = (textInput: HTMLTextAreaElement) => {
    mxUtils.setOpacity(textInput, 0);
    textInput.style.width = "1px";
    textInput.style.height = "1px";
    textInput.value = " ";
  }

  private readonly initAction = (graph: IMxGraph, clipboard: IClipboardContext): IMxActions => {
    return {
      copy: {
        func: () => {
          clipboard.copyFuncForMenu(graph, clipboard.copy, clipboard.textInput);
          const text = clipboard.textInput.value;
          navigator.clipboard.writeText(text)
            .then(
              (result) => {
                // tslint:disable-next-line: no-console
                console.log("Successfully copied to clipboard", result);
              }
            )
            .catch(
              (err) => {
                // tslint:disable-next-line: no-console
                console.log("Error! could not copy text", err);
              });
        },
      },
      cut: {
        func: () => {
          clipboard.cutFunc(graph, clipboard.copy, clipboard.textInput);
          const text = clipboard.textInput.value;
          navigator.clipboard.writeText(text)
            .then(
              (result) => {
                // tslint:disable-next-line: no-console
                console.log("Successfully copied to clipboard", result);
              }
            )
            .catch(
              (err) => {
                // tslint:disable-next-line: no-console
                console.log("Error! could not copy text", err);
              });
        },
      },
      paste: {
        getFunc(destX, destY): () => void {
          return () => {
            navigator.clipboard.readText()
              .then(
                // tslint:disable-next-line: promise-function-async
                (result) => {
                  // tslint:disable-next-line: no-console
                  console.log("Successfully retrieved text from clipboard", result);
                  clipboard.textInput.focus(); // no listener
                  // tslint:disable-next-line: deprecation
                  clipboard.pasteFuncForMenu(result, graph, clipboard.copy, clipboard.textInput, destX, destY);
                  return Promise.resolve(result);
                }
              )
              .catch(
                (err) => {
                  throw new Error("Error! read text from clipboard");
                });
          };
        },
      },
      undo: {
        func: () => {
          this.undoManager.undo();
        },
      },
      redo: {
        func: () => {
          this.undoManager.redo();
        },
      },
      zoomIn: {
        func: () => {
          graph.zoomIn();
        },
      },
      zoomOut: {
        func: () => {
          graph.zoomOut();
        },
      },
      deleteCell: {
        func: () => {
          graph.removeCells();
        },
      },
      fit: {
        func: () => {
          graph.fit();
        }
      }

    };

  }
}
