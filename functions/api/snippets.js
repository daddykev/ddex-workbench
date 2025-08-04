// functions/api/snippets.js
const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Middleware to check authentication (optional for GET, required for POST/PUT/DELETE)
const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split('Bearer ')[1];
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.user = decodedToken;
    } catch (error) {
      // Continue without auth
    }
  }
  next();
};

const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  try {
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    res.status(401).json({ error: { message: 'Invalid token' } });
  }
};

// Get snippets with filtering
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { category, tags, search, sort = 'popular', limit = 20, startAfter } = req.query;
    
    let query = admin.firestore().collection('snippets');
    
    // Apply filters
    if (category && category !== 'all') {
      query = query.where('category', '==', category);
    }
    
    if (tags && tags.length > 0) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query = query.where('tags', 'array-contains-any', tagArray);
    }
    
    // Apply sorting
    switch (sort) {
      case 'recent':
        query = query.orderBy('created', 'desc');
        break;
      case 'votes':
        query = query.orderBy('votes', 'desc');
        break;
      case 'popular':
      default:
        query = query.orderBy('votes', 'desc');
    }
    
    // Apply pagination
    query = query.limit(parseInt(limit));
    
    if (startAfter) {
      const lastDoc = await admin.firestore().collection('snippets').doc(startAfter).get();
      if (lastDoc.exists) {
        query = query.startAfter(lastDoc);
      }
    }
    
    const snapshot = await query.get();
    
    // Get user votes if authenticated
    const userVotes = {};
    if (req.user) {
      const votesSnapshot = await admin.firestore()
        .collection('users')
        .doc(req.user.uid)
        .collection('votes')
        .get();
      
      votesSnapshot.forEach(doc => {
        userVotes[doc.id] = doc.data().vote;
      });
    }
    
    const snippets = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        userVote: userVotes[doc.id] || 0,
        created: data.created.toDate().toISOString(),
        updated: data.updated?.toDate().toISOString()
      };
    });
    
    // Search filtering (basic implementation)
    let filteredSnippets = snippets;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredSnippets = snippets.filter(snippet => 
        snippet.title.toLowerCase().includes(searchLower) ||
        snippet.description.toLowerCase().includes(searchLower) ||
        snippet.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
    }
    
    res.json({
      snippets: filteredSnippets,
      total: filteredSnippets.length,
      hasMore: snapshot.docs.length === parseInt(limit)
    });
  } catch (error) {
    console.error('Error fetching snippets:', error);
    res.status(500).json({ error: { message: 'Failed to fetch snippets' } });
  }
});

// Create new snippet
router.post('/', requireAuth, async (req, res) => {
  try {
    const { title, description, content, category, tags, ernVersion } = req.body;
    
    // Validation
    if (!title || !description || !content || !category) {
      return res.status(400).json({ 
        error: { message: 'Title, description, content, and category are required' } 
      });
    }
    
    // Get user info
    const userDoc = await admin.firestore().collection('users').doc(req.user.uid).get();
    const userData = userDoc.data();
    
    const snippetData = {
      title: title.trim(),
      description: description.trim(),
      content,
      category,
      tags: tags || [],
      ernVersion: ernVersion || '4.3',
      author: {
        uid: req.user.uid,
        displayName: userData?.displayName || req.user.email.split('@')[0]
      },
      votes: 0,
      commentCount: 0,
      views: 0,
      created: admin.firestore.FieldValue.serverTimestamp(),
      updated: admin.firestore.FieldValue.serverTimestamp()
    };
    
    const docRef = await admin.firestore().collection('snippets').add(snippetData);
    
    // Update user's snippet count
    await admin.firestore().collection('users').doc(req.user.uid).update({
      snippetCount: admin.firestore.FieldValue.increment(1)
    });
    
    res.json({
      id: docRef.id,
      ...snippetData,
      created: new Date().toISOString(),
      updated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating snippet:', error);
    res.status(500).json({ error: { message: 'Failed to create snippet' } });
  }
});

// Vote on snippet
router.post('/:snippetId/vote', requireAuth, async (req, res) => {
  try {
    const { snippetId } = req.params;
    const { vote } = req.body;
    
    if (![-1, 0, 1].includes(vote)) {
      return res.status(400).json({ 
        error: { message: 'Vote must be -1, 0, or 1' } 
      });
    }
    
    const snippetRef = admin.firestore().collection('snippets').doc(snippetId);
    const voteRef = admin.firestore()
      .collection('users')
      .doc(req.user.uid)
      .collection('votes')
      .doc(snippetId);
    
    // Get current vote
    const currentVoteDoc = await voteRef.get();
    const currentVote = currentVoteDoc.exists ? currentVoteDoc.data().vote : 0;
    
    // Update in transaction
    await admin.firestore().runTransaction(async (transaction) => {
      const snippetDoc = await transaction.get(snippetRef);
      
      if (!snippetDoc.exists) {
        throw new Error('Snippet not found');
      }
      
      let voteChange = vote - currentVote;
      
      if (vote === 0) {
        // Remove vote
        transaction.delete(voteRef);
      } else {
        // Add/update vote
        transaction.set(voteRef, { 
          vote, 
          timestamp: admin.firestore.FieldValue.serverTimestamp() 
        });
      }
      
      // Update snippet vote count
      transaction.update(snippetRef, {
        votes: admin.firestore.FieldValue.increment(voteChange)
      });
    });
    
    res.json({ success: true, vote });
  } catch (error) {
    console.error('Error voting:', error);
    res.status(500).json({ error: { message: 'Failed to vote' } });
  }
});

module.exports = router;