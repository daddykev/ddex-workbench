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
    case 'oldest':
      q = query(q, orderBy('created', 'asc'))
      break
    case 'recent':
    default:
      q = query(q, orderBy('created', 'desc'))
  }
  
  if (params.limit) {
    q = query(q, limit(params.limit))
  }
  
  const snapshot = await getDocs(q)
  const snippets = []
  
  snapshot.forEach(doc => {
    const data = doc.data()
    snippets.push({
      id: doc.id,
      ...data,
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
}

