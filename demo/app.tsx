import * as React from "react";
import { hot } from "react-hot-loader";

import {
  CanvasMenu,
  Command,
  ContextMenu,
  EdgeMenu,
  Flow,
  Item,
  ItemPanel,
  MxGraph,
  VertexMenu,
  ToolCommand,
  Toolbar,
  Minimap,
  NodePanel,
  EdgePanel,
  CanvasPanel,
  DetailPanel,
  TextEditor,
  RegisterNode,
} from "../src/index";
import "./index.scss";

const data = {
  nodes: [{
    type: "node",
    size: [70, 70],
    shape: "flow-circle",
    color: "#FA8C16",
    label: "起止节点",
    x: 55,
    y: 55,
    id: "ea1184e8",
    index: 0,
  },      {
    type: "node",
    size: [70, 70],
    shape: "flow-circle",
    color: "#FA8C16",
    label: "结束节点",
    x: 55,
    y: 255,
    id: "481fbb1a",
    index: 2,
  }],
  edges: [{
    source: "ea1184e8",
    sourceAnchor: 2,
    target: "481fbb1a",
    targetAnchor: 0,
    id: "7989ac70",
    index: 1,
  }],
};

const shortCutStyle = {
  color: "silver",
  fontSize: 10,
};

const Demo = () => (
  <div>
    <MxGraph>
      <ItemPanel>
        <Item shape="rounded" size="70*30" model={{color: "#FA8C16", label: "Item 1", }}>Rounded</Item>
        <Item shape="rounded2" size="200*60" model={{color: "#FA8C16", label: "Item 1", }}>Rounded2</Item>
      </ItemPanel>
      <Flow
        data={data}
      />
      <Toolbar>
        <ToolCommand name="copy" >Copy  <span style={shortCutStyle}>Ctrl + C</span></ToolCommand>
        <ToolCommand name="cut" >Cut  <span style={shortCutStyle}>Ctrl + X</span></ToolCommand>
        <ToolCommand name="paste" >Paste  <span style={shortCutStyle}>Ctrl + V</span></ToolCommand>
        <ToolCommand name="undo" >undo <span style={shortCutStyle}>Ctrl + Z</span></ToolCommand>
        <ToolCommand name="redo" >redo</ToolCommand>
        <ToolCommand name="zoomIn" >zoomIn</ToolCommand>
        <ToolCommand name="zoomOut" >zoomOut</ToolCommand>
        <ToolCommand name="deleteCell" >delete select cell  <span style={shortCutStyle}>Backspace</span></ToolCommand>
        <ToolCommand name="fit" >fit</ToolCommand>
      </Toolbar>
      <ContextMenu>
        <VertexMenu >
          <Command name="copy" text="Copy"/>
          <Command name="cut" text="Cut"/>
          <Command name="separator" />
          <Command name="paste" text="Paste"/>
        </VertexMenu>
        <EdgeMenu >
          <Command name="copy" text="Copy"/>
          <Command name="cut" text="Cut"/>
          <Command name="paste" text="Paste"/>
        </EdgeMenu>
        <CanvasMenu>
          <Command name="copy" text="Copy"/>
          <Command name="cut" text="Cut"/>
          <Command name="paste" text="Paste"/>
        </CanvasMenu>
      </ContextMenu>
<<<<<<< HEAD
      <DetailPanel > 
        <NodePanel >
          <TextEditor name="cell" />
        </NodePanel>
        <EdgePanel >
          <TextEditor name="cell" />
        </EdgePanel>
      </DetailPanel>
      <RegisterNode name="rounded" config={{rounded: 1, fillColor: "white", points: [[0.5,0], [0.5, 1], [0, 0.5], [1, 0.5]],
        fontColor: "grey", fontSize: 10, strokeWidth: 1, strokeColor: "grey", shadow: 1}} extend="rectangle" />
      <RegisterNode name="rounded2" config={{rounded: 1, fillColor: "white", points: [[0.5,0], [0.5, 1], [0, 0.5], [1, 0.5]],
        fontColor: "grey", fontSize: 10, strokeWidth: 1, strokeColor: "grey", shadow: 1, arcSize: 50}} extend="rectangle" />
=======
      <Minimap/>
>>>>>>> add minimap
    </MxGraph>
  </div>

);

export const App = hot(module)(Demo);
