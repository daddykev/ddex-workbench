// functions/api/deezer.js
const express = require('express');
const router = express.Router();

// Deezer API endpoints
const DEEZER_BASE_URL = 'https://api.deezer.com';

// Search album by UPC
router.get('/album/:upc', async (req, res) => {
  try {
    const { upc } = req.params;
    const cleanUPC = upc.replace(/[\s-]/g, '');
    
    console.log('Fetching Deezer album for UPC:', cleanUPC);
    
    // Fetch album data from Deezer
    const response = await fetch(`${DEEZER_BASE_URL}/album/upc:${cleanUPC}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return res.status(404).json({ 
          error: { message: 'Album not found on Deezer' } 
        });
      }
      throw new Error(`Deezer API error: ${response.status}`);
    }
    
    const album = await response.json();
    
    if (album.error) {
      return res.status(404).json({ 
        error: { message: album.error.message || 'Album not found' } 
      });
    }
    
    // Return album data
    res.json({ success: true, album });
    
  } catch (error) {
    console.error('Error fetching Deezer album:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch album from Deezer' } 
    });
  }
});

// Get album tracks
router.get('/album/:albumId/tracks', async (req, res) => {
  try {
    const { albumId } = req.params;
    const { index = 0, limit = 50 } = req.query;
    
    console.log(`Fetching tracks for album ${albumId}, index: ${index}, limit: ${limit}`);
    
    const response = await fetch(
      `${DEEZER_BASE_URL}/album/${albumId}/tracks?index=${index}&limit=${limit}`
    );
    
    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      return res.status(400).json({ 
        error: { message: data.error.message } 
      });
    }
    
    res.json(data);
    
  } catch (error) {
    console.error('Error fetching album tracks:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch tracks from Deezer' } 
    });
  }
});

// Get track details (with ISRC)
router.get('/track/:trackId', async (req, res) => {
  try {
    const { trackId } = req.params;
    
    console.log('Fetching track details for ID:', trackId);
    
    const response = await fetch(`${DEEZER_BASE_URL}/track/${trackId}`);
    
    if (!response.ok) {
      throw new Error(`Deezer API error: ${response.status}`);
    }
    
    const track = await response.json();
    
    if (track.error) {
      return res.status(400).json({ 
        error: { message: track.error.message } 
      });
    }
    
    res.json(track);
    
  } catch (error) {
    console.error('Error fetching track details:', error);
    res.status(500).json({ 
      error: { message: 'Failed to fetch track details from Deezer' } 
    });
  }
});

// Batch fetch track ISRCs (optimized for rate limiting)
router.post('/tracks/batch-isrc', async (req, res) => {
  try {
    const { trackIds } = req.body;
    
    if (!trackIds || !Array.isArray(trackIds)) {
      return res.status(400).json({ 
        error: { message: 'trackIds array is required' } 
      });
    }
    
    console.log(`Batch fetching ISRCs for ${trackIds.length} tracks`);
    
    // Fetch all tracks in parallel (be careful with rate limits)
    const promises = trackIds.map(async (trackId) => {
      try {
        const response = await fetch(`${DEEZER_BASE_URL}/track/${trackId}`);
        if (response.ok) {
          const track = await response.json();
          return {
            id: trackId,
            isrc: track.isrc || null,
            title: track.title
          };
        }
        return { id: trackId, isrc: null };
      } catch (error) {
        console.error(`Failed to fetch track ${trackId}:`, error);
        return { id: trackId, isrc: null };
      }
    });
    
    const results = await Promise.all(promises);
    
    res.json({ tracks: results });
    
  } catch (error) {
    console.error('Error batch fetching ISRCs:', error);
    res.status(500).json({ 
      error: { message: 'Failed to batch fetch ISRCs' } 
    });
  }
});

module.exports = router;