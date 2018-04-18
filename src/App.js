import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import axios from 'axios';
// import Masonry from 'react-masonry-component';
import { AutoSizer, CellMeasurer, CellMeasurerCache, createMasonryCellPositioner, Masonry, WindowScroller } from 'react-virtualized';
import 'react-virtualized/styles.css';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      list: {},
      breedsList: [],
      breedsListReady: false,
      imgReady: false
    }

    axios.get('https://dog.ceo/api/breeds/list/all')
    .then((res) => {
      this.setState({ list: {...res.data.message} })

      let temp_breeds_list = [];
      for (let breed in this.state.list) {
        if (this.state.list[breed].length > 0) {
          this.state.list[breed].forEach(subBreed => {
            temp_breeds_list.push(axios.get(`https://dog.ceo/api/breed/${breed}/${subBreed}/images`));
          });
        } else {
          temp_breeds_list.push(axios.get(`https://dog.ceo/api/breed/${breed}/images`));
        }
      }

      this.setState({ 
        breeds: temp_breeds_list,
        breedsListReady: true
      });

      let temp_img_list = [];
     
      axios.all(this.state.breeds)
      .then((res) => {
        res.forEach(response => {
          temp_img_list = temp_img_list.concat(response.data.message);
        });

        this.setState({
          breedsList: temp_img_list,
          imgReady: true
        });
      });
    })
    .catch((err) => {
      console.error(err);
    });

    // Default sizes help Masonry decide how many images to batch-measure
    this.cache = new CellMeasurerCache({
      defaultHeight: 300,
      defaultWidth: 200,
      fixedWidth: true
    })

    // Our masonry layout will use 3 columns with a 10px gutter between
    this.cellPositioner = createMasonryCellPositioner({
      cellMeasurerCache: this.cache,
      columnCount: 3,
      columnWidth: 200,
      spacer: 10
    })

    this.cellRenderer = ({ index, key, parent, style }) => {
      const datum = this.state.breedsList[index]
    
      return (
        <CellMeasurer
          cache={this.cache}
          index={index}
          key={key}
          parent={parent}
        >
          <div style={style}>
            <img
              src={datum}
              style={{
                width: 200,
                height: 300
              }}
            />
          </div>
        </CellMeasurer>
      )
    }

  }

  render() {

    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        
        <div className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload. <br />

          {this.state.imgReady ?
            <Masonry
              cellCount={this.state.breedsList.length}
              cellMeasurerCache={this.cache}
              cellPositioner={this.cellPositioner}
              cellRenderer={this.cellRenderer}
              height={600}
              width={800}
            />
            : "loading..."}
        </div>
      </div>
    );
  }
}

export default App;
