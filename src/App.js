import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

import axios from 'axios';

class App extends Component {
  state = {
    list: {},
    breeds: []
  }

  componentDidMount() {
    axios.get('https://dog.ceo/api/breeds/list/all')
    .then((res) => {
      this.setState({ list: {...res.data.message} })

      let temp_breeds_list = [];
      for (let breed in this.state.list) {
        if (this.state.list[breed].length > 0) {
          this.state.list[breed].forEach(subBreed => {
            temp_breeds_list.push({
              name: subBreed + ' ' + breed,
              url: `https://dog.ceo/api/breed/${breed}/${subBreed}/images`
            })
          });
        } else {
          temp_breeds_list.push({
            name: breed,
            url: `https://dog.ceo/api/breed/${breed}/images`
          })
        }
      }

      this.setState({ breeds: temp_breeds_list });
    })
    .catch((err) => {
      console.error(err);
    });
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.js</code> and save to reload. <br />
          {this.state.breeds.length > 0 ? this.state.breeds[15].url : "loading..."}
        </p>
      </div>
    );
  }
}

export default App;
