import { spotifyInstance, createHeader } from './axiosInstances';

export function getUserInfo() {
  return spotifyInstance.get('me', createHeader());
}
