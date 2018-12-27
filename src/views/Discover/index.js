import React, { Component, Fragment } from 'react';
import './discover.css';

import { getNewReleases } from '../../services/newReleases';
import { getMultipleArtists } from '../../services/artists';
import { albumsList as parseAlbums } from '../../utils/spotifyResponseParsers';
import { getGlobalTopTracks } from '../../services/playlists';
import {
  parsePlaylistTracks,
  parseArtist
} from '../../utils/spotifyResponseParsers';
import { serverError } from '../../utils/errors';

import PageContainer from '../../components/PageContainer/pageContainer';
import Carousel from '../../components/Carousel/carousel';
import WhatsNew from '../../components/WhatsNew/whatsNew';
import TopSongsAndArtists from '../../components/TopSongsAndArtists/topSongsAndArtists';
import Spinner from '../../components/Spinner/spinner';
import { UserPlaylist } from '../../components/Playlists/userPlaylists';

const filterRepeated = (idsList) => [...new Set(idsList)];

export default class List extends Component {
  state = {
    albums: [],
    topTracks: [],
    artists: [],
    error: '',
    noPadding: true,
    loaded: false
  };

  componentDidMount = () => {
    Promise.all([getNewReleases(), getGlobalTopTracks()])
      .then(([rawAlbums, rawTopTracks]) => {
        const albums = parseAlbums(rawAlbums);
        const topTracks = parsePlaylistTracks(rawTopTracks.tracks.items);
        const artistsIds = topTracks.map((track) => track.artist.id);
        const topArtists = filterRepeated(artistsIds);

        getMultipleArtists(topArtists.slice(0, 5)).then((rawArtists) => {
          const artists = rawArtists.map((artist) => parseArtist(artist));
          this.setState({
            artists,
            albums,
            topTracks,
            loaded: true
          });
        });
      })
      .catch((error) => {
        this.setState({ error: serverError(error), noPadding: false });
      });
  };

  render = () => {
    const {
      artists = [],
      albums = [],
      topTracks = [],
      error,
      noPadding,
      loaded
    } = this.state;

    const discoverView = (
      <Fragment>
        <Carousel items={artists} />
        <div className="discover">
          <WhatsNew albums={albums.slice(0, 4)} />
          <div className="discover__top">
            <TopSongsAndArtists artists={artists} songs={topTracks} />
          </div>
          <div className="discover__divider" />
        </div>
        <UserPlaylist />
      </Fragment>
    );

    return (
      <PageContainer noPadding={noPadding}>
        {error || loaded ? discoverView : <Spinner />}
      </PageContainer>
    );
  };
}
