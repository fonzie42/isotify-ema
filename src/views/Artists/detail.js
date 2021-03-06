import React, { Component } from 'react';
import BannerArtist from '../../components/BannerArtist/bannerArtist';
import ArtistNavigationItems from '../../components/ArtistNavigationItems/artistNavigationItems';
import AlbumsGrid from '../../components/albums/albumsGrid/albumsGrid';
import Grid from '../../components/Grid/grid';
import Track from '../../components/Track/track';
import PageContainer from '../../components/PageContainer/pageContainer';

import { getArtist } from '../../services/artists';
import { getArtistTopTracks } from '../../services/tracks';
import {
  artistWithAlbumsAndRelated as parseArtist,
  completeTracks as parseTracks
} from '../../utils/spotifyResponseParsers';
import { serverError } from '../../utils/errors';

const createAlbumComponent = (albums) => (
  <div className="artists-view__wrap">
    <AlbumsGrid {...{ albums, size: 'big' }} />
  </div>
);

const createTopSongsComponent = (tracks) => (
  <div className="artists-view__wrap">
    <Grid size="big" type="tracks">
      {tracks.map((track) => {
        return <Track {...{ key: track.id, size: 'big', ...track }} />;
      })}
    </Grid>
  </div>
);

export default class Details extends Component {
  state = {
    name: '',
    albums: [],
    tracks: [],
    albumsAmount: 0,
    songsAmount: 0,
    relatedArtists: [],
    imgSrc: '',
    error: '',
    loaded: false
  };

  fetchArtistData = (artistId) => {
    Promise.all([getArtist(artistId), getArtistTopTracks(artistId)])
      .then(([artistInfo, { tracks: artistTracks }]) => {
        const {
          name,
          albums,
          totalTracks: songsAmount,
          relatedArtists,
          imgSrc
        } = parseArtist(artistInfo);
        const tracks = parseTracks(artistTracks);

        this.setState({
          name,
          albums,
          songsAmount,
          relatedArtists,
          albumsAmount: albums.length,
          imgSrc,
          loaded: true,
          tracks
        });
      })
      .catch((error) => {
        this.setState({ error: serverError(error) });
      });
  };

  getTracks = () => {
    const { artistId, nextTrack, tracks } = this.state;
    getArtistTopTracks(artistId, nextTrack)
      .then((rawTracks) => {
        const newTracks = parseTracks(rawTracks.items);
        const { next } = rawTracks;
        this.setState({
          tracks: tracks.concat(newTracks),
          next
        });
      })
      .catch((error) => {
        this.setState({ error: serverError(error) });
      });
  };

  getCurrentArtistId = () => this.props.match.params.artistId;

  componentDidUpdate(prevProps) {
    const artistId = this.getCurrentArtistId();
    if (prevProps.match.params.artistId !== artistId) {
      this.fetchArtistData(artistId);
    }
  }

  componentDidMount() {
    const artistId = this.getCurrentArtistId();
    this.fetchArtistData(artistId);
  }

  render = () => {
    const {
      name,
      albums,
      tracks,
      songsAmount,
      albumsAmount,
      relatedArtists,
      imgSrc,
      error,
      loaded
    } = this.state;

    const items = [
      {
        name: 'Albums',
        component: createAlbumComponent(albums)
      },
      {
        name: 'Top Songs',
        component: createTopSongsComponent(tracks)
      }
    ];

    return (
      <PageContainer {...{ error, loaded, noPadding: true }}>
        <BannerArtist
          {...{
            name,
            albumsAmount,
            songsAmount,
            relatedArtists,
            imgSrc
          }}
        />

        <ArtistNavigationItems {...{ items }} />
      </PageContainer>
    );
  };
}
