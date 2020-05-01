# react-mxgraph

Note that this project is a fork and is currently a giant hairball of a mess (not mine).

I'll be trying to clean it up and document it, so that it can be useful as a good starting point for providing basic diagramming functionality for React apps.

## Quick start

`npm run dev`

Start local web server on port 8080 and launches app in web browser:

<img src="./docs/images/react-mxgraph.png" width="80%"/>

## Design

The code is written in TypeScript using React 16 as the framework.

### Web dev mode

When you run `npm run dev` it launches the webpack dev server with the demo app

```json
  plugins: [
    new webpack.NamedModulesPlugin(), // prints more readable module names in the browser console on HMR updates
    new HtmlWebpackPlugin({
      template: 'demo/index.html'
    })
  ],
```

### MxGraph

The `MxGraph` component controls the mxgraph diagram. 
Main functionalities: 

- undo manager
- ...

The graph adds a MouseListener via `addMouseListener` which sets up handlers for various mouse events.
Furthermore action handlers are defined for:

- cut (Ctrl-X)
- copy (Ctrl-C)
- paste (Ctrl-V)
- undo (Ctrl-Z)
- redo
- zoom in
- zoom out
- delete cell
- fit

The `app.tsx` in the `demo` app:

```tsx
<MxGraph>
  ...
</>
```  

```tsx
<PropsComponent data={data2}/>
```

The `PropsComponent` is `withPropsApi(WrappedComponent)` which build a Props API

```js
const propsAPI: IPropsAPI = {
  graph,
  executeCommand: (command) => {
    // ...
  },
  find: (id),
  getSelected: (),
  ...
}
```

The API is passed as a prop to `WrappedComponent` which renders buttons and form inputs to execute the API with specific data to demonstate the functionality

```tsx
<WrappedComponent propsAPI={propsAPI} {...this.props} />
```

### ItemPanel

The Item panel defines shapes that can be added to the graph?

```tsx
  <ItemPanel>
    <Item shape="rounded" size="70*30" model={{ color: "#FA8C16", label: "Item 1", }}>Rounded</Item>
    <Item shape="rounded2" size="200*60" model={{ color: "#FA8C16", label: "Item 1", }}>Rounded2</Item>
  </ItemPanel>
```

Item adds toolbar items to the graph in the `Item` component `render` function:

```ts
this.addToolbarItem(graph, container);
```

### Flow

The Flow displays the Graph itself, the model in terms of nodes and edges

```tsx
  <Flow
    data={data}
    shortcut={{moveRight: true}}
  />
```

The function `setGraph` is passed in via the context

```tsx
<MxGraphContext.Consumer>{(value: IMxGraphContext) => {
  const {
    graph,
    setGraph,
    readData,
  } = value;
  this._setGraph = setGraph;
```

`setGraph` is then used to display the graph on component mouunt


```ts
  public readonly componentDidMount = (): void => {
    if (!this._setGraph) {
      throw new Error("_setGraph does not initialized!");
    }

    this._initMxGraph(this._setGraph);
  }

  private readonly _initMxGraph = (setGraph: (graph: IMxGraph) => void): void => {
    if (this._containerRef.current === null) {
      throw new Error("empty flow container!");
    }

    const graph = new mxGraph(this._containerRef.current);

    setGraph(graph);

  }
```

### Toolbar

The toolbar is the primitive toolbar displayed right under the graph

```tsx
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
```  

### ContextMenu

```tsx
  <ContextMenu>
    <VertexMenu >
      <Command name="copy" text="Copy" />
      <Command name="cut" text="Cut" />
      <Command name="separator" />
      <Command name="paste" text="Paste" />
    </VertexMenu>
    <EdgeMenu >
      <Command name="copy" text="Copy" />
      <Command name="cut" text="Cut" />
      <Command name="paste" text="Paste" />
    </EdgeMenu>
    <CanvasMenu>
      <Command name="copy" text="Copy" />
      <Command name="cut" text="Cut" />
      <Command name="paste" text="Paste" />
    </CanvasMenu>
  </ContextMenu>
```

### DetailPanel

```tsx
  <DetailPanel >
    <NodePanel >
      <TextEditor name="cell" />
    </NodePanel>
    <EdgePanel >
      <TextEditor name="cell" />
    </EdgePanel>
  </DetailPanel>
```

### RegisterNode

```tsx
  <RegisterNode name="rounded" config={{
    rounded: 1, fillColor: "white", points: [[0.5, 0], [0.5, 1], [0, 0.5], [1, 0.5]],
    fontColor: "grey", fontSize: 10, strokeWidth: 1, strokeColor: "grey", shadow: 1
  }} extend="rectangle" />
  <RegisterNode name="rounded2" config={{
    rounded: 1, fillColor: "white", points: [[0.5, 0], [0.5, 1], [0, 0.5], [1, 0.5]],
    fontColor: "grey", fontSize: 10, strokeWidth: 1, strokeColor: "grey", shadow: 1, arcSize: 50
  }} extend="rectangle" />
```

### CustomCommand

```tsx
  <CustomCommand />
```  

## Context Menu

The context menu manages and displays the context menu, activated by right clicking on a cell (node, edge etc) or the canvas itself. Currently it displays only:

- copy
- paste
- cut

The menu is displayed by iterating through the `currentMenu` list of menu items.

`const currentMenu: IMenu[] = this._getMenuFromCell(cell);`

