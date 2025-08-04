// services/snippets.js
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  getDocs,
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  increment
} from 'firebase/firestore'
import { db, auth } from '@/firebase'

/**
 * Get snippets with filtering
 */
export const getSnippets = async (params = {}) => {
  const snippetsRef = collection(db, 'snippets')
  let q = query(snippetsRef)
  
  // Apply filters
  if (params.category && params.category !== 'all') {
    q = query(q, where('category', '==', params.category))
  }
  
  // Apply sorting
  switch (params.sort) {
    case 'recent':
      q = query(q, orderBy('created', 'desc'))
      break
    case 'votes':
      q = query(q, orderBy('votes', 'desc'))
      break
    default:
      q = query(q, orderBy('votes', 'desc'))
  }
  
  if (params.limit) {
    q = query(q, limit(params.limit))
  }
  
  const snapshot = await getDocs(q)
  const snippets = []
  
  // Get user votes if authenticated
  const userVotes = {}
  if (auth.currentUser) {
    const votesRef = collection(db, 'users', auth.currentUser.uid, 'votes')
    const votesSnapshot = await getDocs(votesRef)
    votesSnapshot.forEach(doc => {
      userVotes[doc.id] = doc.data().vote
    })
  }
  
  snapshot.forEach(doc => {
    const data = doc.data()
    snippets.push({
      id: doc.id,
      ...data,
      userVote: userVotes[doc.id] || 0,
      created: data.created?.toDate().toISOString(),
      updated: data.updated?.toDate().toISOString()
    })
  })
  
  // Client-side filtering for search and tags
  let filteredSnippets = snippets
  
  if (params.search) {
    const searchLower = params.search.toLowerCase()
    filteredSnippets = snippets.filter(snippet => 
      snippet.title.toLowerCase().includes(searchLower) ||
      snippet.description.toLowerCase().includes(searchLower) ||
      snippet.tags.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }
  
  if (params.tags && params.tags.length > 0) {
    filteredSnippets = filteredSnippets.filter(snippet =>
      params.tags.some(tag => snippet.tags.includes(tag))
    )
  }
  
  return {
    snippets: filteredSnippets,
    total: filteredSnippets.length
  }
}

/**
 * Create a new snippet
 */
export const createSnippet = async (snippetData) => {
  if (!auth.currentUser) {
    throw new Error('Must be authenticated to create snippets')
  }
  
  const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid))
  const userData = userDoc.data()
  
  const snippet = {
    ...snippetData,
    author: {
      uid: auth.currentUser.uid,
      displayName: userData?.displayName || auth.currentUser.email.split('@')[0]
    },
    votes: 0,
    commentCount: 0,
    views: 0,
    created: serverTimestamp(),
    updated: serverTimestamp()
  }
  
  const docRef = await addDoc(collection(db, 'snippets'), snippet)
  
  // Update user's snippet count
  await updateDoc(doc(db, 'users', auth.currentUser.uid), {
    snippetCount: increment(1)
  })
  
  return {
    id: docRef.id,
    ...snippet,
    created: new Date().toISOString(),
    updated: new Date().toISOString()
  }
}

/**
 * Update a snippet
 */
export const updateSnippet = async (snippetId, updates) => {
  if (!auth.currentUser) {
    throw new Error('Must be authenticated to update snippets')
  }
  
  const snippetRef = doc(db, 'snippets', snippetId)
  const snippetDoc = await getDoc(snippetRef)
  
  if (!snippetDoc.exists()) {
    throw new Error('Snippet not found')
  }
  
  const snippetData = snippetDoc.data()
  
  // Check ownership
  if (snippetData.author.uid !== auth.currentUser.uid) {
    throw new Error('You can only edit your own snippets')
  }
  
  // Update the snippet
  await updateDoc(snippetRef, {
    ...updates,
    updated: serverTimestamp()
  })
  
  // Return updated data
  const updatedDoc = await getDoc(snippetRef)
  const updatedData = updatedDoc.data()
  
  return {
    id: snippetId,
    ...updatedData,
    created: updatedData.created?.toDate().toISOString(),
    updated: updatedData.updated?.toDate().toISOString()
  }
}

/**
 * Delete a snippet
 */
export const deleteSnippet = async (snippetId) => {
  if (!auth.currentUser) {
    throw new Error('Must be authenticated to delete snippets')
  }
  
  const snippetRef = doc(db, 'snippets', snippetId)
  const snippetDoc = await getDoc(snippetRef)
  
  if (!snippetDoc.exists()) {
    throw new Error('Snippet not found')
  }
  
  const snippetData = snippetDoc.data()
  
  // Check ownership
  if (snippetData.author.uid !== auth.currentUser.uid) {
    throw new Error('You can only delete your own snippets')
  }
  
  // Delete the snippet
  await deleteDoc(snippetRef)
  
  // Update user's snippet count
  await updateDoc(doc(db, 'users', auth.currentUser.uid), {
    snippetCount: increment(-1)
  })
  
  // Clean up votes (this could be done in a Cloud Function for better performance)
  // For now, we'll skip this as it requires a collection group query
}

/**
 * Vote on a snippet
 */
export const voteSnippet = async (snippetId, vote) => {
  if (!auth.currentUser) {
    throw new Error('Must be authenticated to vote')
  }
  
  const snippetRef = doc(db, 'snippets', snippetId)
  const voteRef = doc(db, 'users', auth.currentUser.uid, 'votes', snippetId)
  
  // Get current vote
  const voteDoc = await getDoc(voteRef)
  const currentVote = voteDoc.exists() ? voteDoc.data().vote : 0
  const voteChange = vote - currentVote
  
  // Use a transaction to update both the vote and the snippet count
  const batch = db.batch()
  
  if (vote === 0) {
    // Remove vote
    batch.delete(voteRef)
  } else {
    // Add/update vote
    batch.set(voteRef, { 
      vote, 
      timestamp: serverTimestamp() 
    })
  }
  
  // Update snippet vote count
  batch.update(snippetRef, {
    votes: increment(voteChange)
  })
  
  await batch.commit()
  
  return { success: true, vote }
}