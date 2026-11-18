// services/deezerApi.js
import apiClient from './api'

export class DeezerAPI {
  constructor() {
    // Use the same API client as other services
    this.client = apiClient
  }

  async searchByUPC(upc) {
    const cleanUPC = upc.replace(/[\s-]/g, '')
    
    try {
      const response = await this.client.get(`/api/deezer/album/${cleanUPC}`)
      return response.data
    } catch (error) {
      console.error('Deezer API error:', error)
      if (error.response?.status === 404) {
        return { success: false, error: 'Album not found' }
      }
      return { success: false, error: error.message }
    }
  }

  async getAlbumTracks(albumId, limit = 50) {
    try {
      let allTracks = []
      let index = 0
      
      while (true) {
        const response = await this.client.get(
          `/api/deezer/album/${albumId}/tracks`,
          { params: { index, limit } }
        )
        const data = response.data
        
        if (data.error) {
          throw new Error(data.error.message)
        }
        
        allTracks = allTracks.concat(data.data)
        
        if (!data.next || data.data.length < limit) break
        index += limit
      }
      
      return allTracks
    } catch (error) {
      console.error('Error fetching tracks:', error)
      throw error
    }
  }

  async getTrackWithISRC(trackId) {
    try {
      const response = await this.client.get(`/api/deezer/track/${trackId}`)
      return response.data
    } catch (error) {
      console.error('Error fetching track details:', error)
      return null
    }
  }

  // Batch fetch ISRCs (more efficient)
  async batchFetchISRCs(trackIds) {
    try {
      const response = await this.client.post('/api/deezer/tracks/batch-isrc', {
        trackIds
      })
      return response.data.tracks
    } catch (error) {
      console.error('Error batch fetching ISRCs:', error)
      return []
    }
  }

  // Rest of the conversion methods remain the same...
  convertToProduct(album) {
    return {
      upc: album.upc || '',
      releaseReference: 'R0',
      title: album.title,
      artist: album.artist?.name || '',
      label: album.label || '',
      releaseType: this.mapReleaseType(album.record_type),
      genre: album.genres?.data?.[0]?.name || '',
      releaseDate: album.release_date,
      originalReleaseDate: '',
      parentalWarning: album.explicit_lyrics ? 'Explicit' : '',
      pLineText: '',
      cLineText: '',
      pLineYear: new Date(album.release_date).getFullYear().toString(),
      cLineYear: new Date(album.release_date).getFullYear().toString(),
      territoryCode: 'Worldwide',
      commercialModel: 'PayAsYouGoModel',
      usageTypes: ['OnDemandStream'],
      dealStartDate: new Date().toISOString().split('T')[0],
      dealEndDate: '',
      tracks: []
    }
  }

  convertToResource(track, index, albumData = {}) {
    const duration = this.secondsToISO8601(track.duration)
    
    return {
      id: Date.now() + index,
      isrc: track.isrc || '',
      resourceReference: `A${index + 1}`,
      title: track.title,
      artist: track.artist?.name || albumData.artist || '',
      duration: duration,
      type: 'MusicalWorkSoundRecording',
      genre: albumData.genre || '',
      parentalWarning: track.explicit_lyrics ? 'Explicit' : '',
      pLineYear: albumData.pLineYear || new Date().getFullYear().toString(),
      pLineText: '',
      previewStartTime: 30,
      previewDetails: {
        startPoint: 30,
        endPoint: 60
      },
      fileUri: '',
      territoryCode: 'Worldwide',
      contributors: [],
      codecType: 'PCM',
      bitRate: '1411',
      samplingRate: '44100',
      bitsPerSample: '16',
      channels: '2'
    }
  }

  mapReleaseType(deezerType) {
    const mapping = {
      'album': 'Album',
      'single': 'Single',
      'ep': 'EP',
      'compilation': 'Album'
    }
    return mapping[deezerType?.toLowerCase()] || 'Album'
  }

  secondsToISO8601(seconds) {
    if (!seconds) return 'PT0M0S'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    let duration = 'PT'
    if (hours > 0) duration += `${hours}H`
    if (minutes > 0) duration += `${minutes}M`
    if (secs > 0) duration += `${secs}S`
    
    return duration || 'PT0M0S'
  }
}

export default new DeezerAPI()