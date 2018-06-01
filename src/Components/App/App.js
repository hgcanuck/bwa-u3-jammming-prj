import React, { Component } from 'react';
import './App.css';
import SearchBar  from '../SearchBar/SearchBar';
import SearchResults from '../SearchResults/SearchResults';
import Playlist  from '../Playlist/Playlist';
import Spotify  from '../../util/Spotify';

class App extends Component {
  constructor(props){
    super(props);

    this.state = {
      searchResults: [],

    playlistName: 'New Playlist',

    playlistTracks: []
  };

    this.addTrack = this.addTrack.bind(this);
    this.removeTrack  = this.removeTrack.bind(this);
    this.updatePlaylistName = this.updatePlaylistName.bind(this);
    this.savePlaylist = this.savePlaylist.bind(this);
    this.search = this.search.bind(this);


  }// end of constructor

addTrack(track){
  if (this.state.playlistTracks.find(savedTrack => savedTrack.id === track.id)) {
    //track already on playlist, ignore request
    return;
  }

  //new track, add to end of playlist
  this.setState({playlistTracks: this.state.playlistTracks.concat(track)})

}

removeTrack(dropTrack){
    //remove selected record from playlist
    this.setState({playlistTracks: this.state.playlistTracks.filter(track => track.id !== dropTrack.id)})
}

updatePlaylistName(name){
  //accept new playlist name
  this.setState({playlistName: name});
}

savePlaylist(){
  const trackURIs= this.state.playlistTracks.map(playlistTrack => {
    return playlistTrack.uri;
  });

  console.log(trackURIs);
  Spotify.savePlaylist(this.state.playlistName,trackURIs);

  //reset Playlist
  this.setState({playlistName: 'New Playlist'});
  this.setState({playlistTracks: []});

}

search(term){
  console.log('search term:' + term);

  Spotify.search(term).then(tracks => {
    if (tracks !== undefined) {
      this.setState({searchResults: tracks});
    }
  });

}

  render() {
    return (
      <div>
        <h1>Ja<span className="highlight">mmm</span>ing</h1>
        <div className="App">
          <SearchBar onSearch={this.search}/>
          <div className="App-playlist">
            <SearchResults searchResults={this.state.searchResults} onAdd={this.addTrack}/>
            <Playlist playlistTracks={this.state.playlistTracks} playlistName ={this.state.playlistName} onRemove={this.removeTrack} onNameChange={this.updatePlaylistName} onSave={this.savePlaylist}/>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
