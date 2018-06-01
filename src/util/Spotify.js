
let userToken='';
const clientID='97a994cc7652448e852df0edca33e63e';
const redirectURL="http://localhost:3000/";

const Spotify = {
  getAccessToken(){
    let tokenURL = '';
    let tokenExpirationTime = '';

    console.log('token set: ' + userToken);
    if (userToken !== ''){
      //token is set
      return userToken;
    }
    else{
      //token not set, redirect user to:  GET https://accounts.spotify.com/authorize

      //search URL for token and expiration time
      tokenURL = window.location.href.match(/access_token=([^&]*)/);
      tokenExpirationTime = window.location.href.match(/expires_in=([^&]*)/);

      if (tokenURL !== null  ){
        //token is present
        console.log('extracting token from URL: ' + userToken);

        //formating tokenURL, removing extra bits
        let t1 = String(tokenURL);
        t1 = t1.substring(t1.lastIndexOf(',') +1);
        tokenURL=t1;

        //setting global token to value from URL
        userToken=tokenURL;

        //formating tokenExpirationTime, removing extra bits
        let t2 = String(tokenExpirationTime);
        t2 = t2.substring(t2.lastIndexOf(',') +1);
        tokenExpirationTime = t2;

        //console.log('Token: ' + tokenURL);
        //console.log('ExpireTime: ' + tokenExpirationTime);

        // exiring token from URL when expiration time has been reached
        window.setTimeout(() =>  userToken = '', tokenExpirationTime * 1000);
        window.history.pushState('Access Token', null, '/');

        return userToken;
      }
      else {
        //token not present, redirect o Spotify
        const url=`https://accounts.spotify.com/authorize?client_id=${clientID}&redirect_uri=${redirectURL}&response_type=token&scope=playlist-modify-public`;
        window.location.replace(url);
      }

    }

  },//end getAccessToken

  search(term){
    this.getAccessToken();
    console.log('token is set: ' + userToken);

    return fetch(`https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/search?type=track&q=${term}` , {
      headers: {
         Authorization: `Bearer ${userToken}`
       }
     }).then(response => {
       return response.json();
     }).then(jsonResponse => {
       if (jsonResponse.tracks) {



         const tracks = jsonResponse.tracks.items.map(track => ({
           id: track.id,
           name: track.name,
           artist: track.artists[0].name,
           album: track.album.name,
           uri: track.uri
         }));

         if (tracks === undefined){
           return [];
         }

         return tracks;
       }
     });

  },

  savePlaylist(namePlaylist, uriTracks){


    //check if arguments are blank
    if (namePlaylist === ''  || (uriTracks.length < 1 || uriTracks === undefined)){
      return;
    }

    //define variables
    let userID ='';
    let playlistID='';
    let snapshotID='';


    // use Spotify API to get userID;
    fetch(`https://cors-anywhere.herokuapp.com/https://api.spotify.com/v1/me` , {
      headers: {
         Authorization: `Bearer ${userToken}`
       }
     }).then(response => {
       return response.json();
     }).then(jsonResponse => {
       //set userId
       userID= jsonResponse.id;
       console.log('userId= ' + userID);


       //Since we have userID, next create playlist
       fetch(`https://api.spotify.com/v1/users/${userID}/playlists` , {
         method: 'POST',
         headers: {
            'Authorization': `Bearer ${userToken}`,
            'Content-Type': 'application/json'
          },
        body: JSON.stringify({name: namePlaylist })
        }).then(response => {

          return response.json();
        }).then(jsonResponse => {
          //set playlistID
          playlistID= jsonResponse.id;
          console.log('Playlist id: ' + playlistID );

          //Transfer tracks to playlist
          fetch(`https://api.spotify.com/v1/users/${userID}/playlists/${playlistID}/tracks` , {
            method: 'POST',
            headers: {
               'Authorization': `Bearer ${userToken}`,
               'Content-Type': 'application/json'
             },
           body: JSON.stringify({uris: uriTracks })
           }).then(response => {

             return response.json();
           }).then(jsonResponse => {
             //set snapshotId
             snapshotID= jsonResponse.snapshot_id ;
             console.log('snapshotID: ' + snapshotID );
           });//fetch transfer

        });//fetch playlist


     });//fetch user id




  }//end savePlaylist

};

export default Spotify;
