import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import axios from 'axios';
import { AutoSizer, CellMeasurer, CellMeasurerCache, createMasonryCellPositioner, Masonry, WindowScroller } from 'react-virtualized';
import 'react-virtualized/styles.css';
import ImageCell from './components/ImageCell';

class App extends Component {
  constructor(props) {
    super(props);

    this.list = {};           // store initial breed list
    this.columnCount = 0;
    this.columnWidth = 400;
    this.gutterSize = 20;

    this.state = {
      breeds_ajax: [],        // list of all image requests (flattened out from the original list tree) 
      breedsList: [],         // store all image src's
      breedsListReady: false  // indicate that the list is ready
    }

    // Initial request to get the breeds list
    axios.get('https://dog.ceo/api/breeds/list/all')
    .then((res) => {
      this.list = {...res.data.message};

      // Flatten out the list tree
      let temp_breeds_list = [];
      
      for (let breed in this.list) {
        if (this.list[breed].length > 0) {
          this.list[breed].forEach(subBreed => {
            temp_breeds_list.push(axios.get(`https://dog.ceo/api/breed/${breed}/${subBreed}/images`));
          });
        } else {
          temp_breeds_list.push(axios.get(`https://dog.ceo/api/breed/${breed}/images`));
        }
      }

      this.setState({ breeds_ajax: temp_breeds_list });

      // Since in our breeds list we only have requests to get
      // images from each breed, we will then make calls to all
      // of the breeds so we can have a list of image src's
      let temp_img_list = [];
     
      axios.all(this.state.breeds_ajax)
      .then((res) => {
        res.forEach(response => {
          temp_img_list = temp_img_list.concat(response.data.message);
        });

        this.setState({
          breedsList: temp_img_list,
          breedsListReady: true
        });
      }).catch((err) => {
        console.error(err);
      });
    })
    .catch((err) => {
      console.error(err);
    });

    // Default sizes help Masonry decide how many images to batch-measure
    this.cache = new CellMeasurerCache({
      defaultHeight: 300,
      defaultWidth: 400,
      fixedWidth: true
    })
  }

  // Initialize the cell position
  initCellPositioner = () => {
    if (typeof this._cellPositioner === 'undefined') {

      this._cellPositioner = createMasonryCellPositioner({
        cellMeasurerCache: this.cache,
        columnCount: this.columnCount,
        columnWidth: this.columnWidth,
        spacer: this.gutterSize,
      });
    }
  }

  // Handle window resize event
  onResize = ({ width }) => {
    this._windowWidth = width;

    this.calculateColumnCount();
    this.resetCellPositioner();
    this._masonry.recomputeCellPositions();
  }

  // Render resizable component containing the masonry component
  renderAutoSizer = ({ height, scrollTop }) => {
    this._windowHeight = height;
    this._scrollTop = scrollTop;

    return (
      <AutoSizer
        disableHeight
        height={height}
        onResize={this.onResize}
        scrollTop={scrollTop}>
        {this.renderMasonry}
      </AutoSizer>
    );
  }

  // Calculate column nubmer based on window size
  calculateColumnCount = () => {
    this.columnCount = Math.floor(this._windowWidth / (this.columnWidth + this.gutterSize));
  }

  // reset cell positioner
  resetCellPositioner = () => {
    this._cellPositioner.reset({
      columnCount: this.columnCount,
      columnWidth: this.columnWidth,
      spacer: this.gutterSize,
    });
  }

  // Render the masonry component
  renderMasonry = ({ height, width, onChildScroll }) => {
    this._windowWidth = width;

    this.calculateColumnCount();
    this.initCellPositioner();

    return (
      <Masonry
        autoHeight
        cellCount={this.state.breedsList.length}
        cellMeasurerCache={this.cache}
        cellPositioner={this._cellPositioner}
        cellRenderer={this.cellRenderer}
        onScroll={onChildScroll}
        scrollTop={this._scrollTop}
        ref={this.setMasonryRef}
        height={this._windowHeight}
        width={this._windowWidth}
      />
    );
  }

  // Render each cell/image
  cellRenderer = ({ index, key, parent, style }) => {
    const img_src = this.state.breedsList[index];

    return (
      <CellMeasurer
        cache={this.cache}
        index={index}
        key={key}
        parent={parent}
      >
        <div style={style}>
          <ImageCell
            src={img_src}
          />
        </div>
      </CellMeasurer>
    )
  }

  // set the masonry ref to _masonry so its methods are available 
  setMasonryRef = (ref) => {
    this._masonry = ref;
  }

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        
        <div className="App-intro">
          {this.state.breedsListReady ?
            <WindowScroller>
              {this.renderAutoSizer}
            </WindowScroller>
            : "loading..."}
        </div>
      </div>
    );
  }
}

export default App;
