<template>
  <div class="admin-page">
    <div class="container">
      <div class="admin-header">
        <h1 class="text-3xl font-semibold">User Management</h1>
        <p class="text-secondary mt-sm">
          Manage registered users and their roles
        </p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="loading-container">
        <font-awesome-icon :icon="['fas', 'spinner']" spin size="2x" />
        <p class="text-secondary mt-md">Loading users...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="alert alert-error">
        <font-awesome-icon :icon="['fas', 'exclamation-circle']" class="mr-sm" />
        {{ error }}
      </div>

      <!-- Users Table -->
      <div v-else class="users-section">
        <div class="section-header">
          <h2 class="text-xl font-medium">
            Registered Users 
            <span class="text-secondary text-base">({{ users.length }})</span>
          </h2>
          <div class="search-box">
            <font-awesome-icon :icon="['fas', 'search']" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Search users..."
              class="form-input search-input"
            />
          </div>
        </div>

        <div class="table-container card">
          <table class="users-table">
            <thead>
              <tr>
                <th>Display Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in filteredUsers" :key="user.uid">
                <td>
                  <div class="user-info">
                    <div class="user-avatar">
                      {{ getUserInitials(user) }}
                    </div>
                    <span>{{ user.displayName || 'No name' }}</span>
                  </div>
                </td>
                <td class="text-secondary">{{ user.email }}</td>
                <td>
                  <span 
                    class="role-badge"
                    :class="`role-${user.role || 'user'}`"
                  >
                    {{ user.role || 'user' }}
                  </span>
                </td>
                <td class="text-secondary">
                  {{ formatDate(user.created) }}
                </td>
                <td>
                  <button
                    v-if="user.uid !== currentUser.uid"
                    @click="toggleUserRole(user)"
                    class="btn btn-sm"
                    :class="user.role === 'admin' ? 'btn-secondary' : 'btn-primary'"
                    :disabled="updatingUserId === user.uid"
                  >
                    <font-awesome-icon 
                      v-if="updatingUserId === user.uid"
                      :icon="['fas', 'spinner']" 
                      spin 
                      class="mr-xs"
                    />
                    <span v-else>
                      {{ user.role === 'admin' ? 'Remove Admin' : 'Make Admin' }}
                    </span>
                  </button>
                  <span v-else class="text-tertiary text-sm">
                    You (current admin)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Empty State -->
          <div v-if="filteredUsers.length === 0" class="empty-state">
            <font-awesome-icon :icon="['fas', 'users']" size="3x" class="text-tertiary" />
            <p class="text-secondary mt-md">
              {{ searchQuery ? 'No users found matching your search' : 'No users found' }}
            </p>
          </div>
        </div>

        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card card">
            <div class="stat-value">{{ totalUsers }}</div>
            <div class="stat-label">Total Users</div>
          </div>
          <div class="stat-card card">
            <div class="stat-value">{{ adminCount }}</div>
            <div class="stat-label">Administrators</div>
          </div>
          <div class="stat-card card">
            <div class="stat-value">{{ regularUserCount }}</div>
            <div class="stat-label">Regular Users</div>
          </div>
          <div class="stat-card card">
            <div class="stat-value">{{ todaySignups }}</div>
            <div class="stat-label">Today's Signups</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebase'
import { useAuth } from '@/composables/useAuth'
import { useRouter } from 'vue-router'

const router = useRouter()
const { user: currentUser } = useAuth()

// State
const users = ref([])
const loading = ref(true)
const error = ref(null)
const searchQuery = ref('')
const updatingUserId = ref(null)

// Check if current user is admin
onMounted(async () => {
  // Redirect if not admin
  if (!currentUser.value || currentUser.value.role !== 'admin') {
    router.push('/')
    return
  }
  
  await fetchUsers()
})

// Fetch all users
const fetchUsers = async () => {
  try {
    loading.value = true
    error.value = null
    
    const usersSnapshot = await getDocs(collection(db, 'users'))
    users.value = usersSnapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data()
    }))
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Failed to load users. Please try again.'
  } finally {
    loading.value = false
  }
}

// Toggle user role between 'user' and 'admin'
const toggleUserRole = async (user) => {
  try {
    updatingUserId.value = user.uid
    const newRole = user.role === 'admin' ? 'user' : 'admin'
    
    await updateDoc(doc(db, 'users', user.uid), {
      role: newRole
    })
    
    // Update local state
    const index = users.value.findIndex(u => u.uid === user.uid)
    if (index !== -1) {
      users.value[index].role = newRole
    }
  } catch (err) {
    console.error('Error updating user role:', err)
    error.value = 'Failed to update user role. Please try again.'
  } finally {
    updatingUserId.value = null
  }
}

// Computed properties
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value
  
  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user => 
    user.displayName?.toLowerCase().includes(query) ||
    user.email?.toLowerCase().includes(query) ||
    user.role?.toLowerCase().includes(query)
  )
})

const totalUsers = computed(() => users.value.length)

const adminCount = computed(() => 
  users.value.filter(u => u.role === 'admin').length
)

const regularUserCount = computed(() => 
  users.value.filter(u => !u.role || u.role === 'user').length
)

const todaySignups = computed(() => {
  const today = new Date().setHours(0, 0, 0, 0)
  return users.value.filter(u => {
    const created = u.created?.toDate?.() || u.created
    return created && new Date(created).setHours(0, 0, 0, 0) === today
  }).length
})

// Helper functions
const getUserInitials = (user) => {
  const name = user.displayName || user.email
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const formatDate = (date) => {
  if (!date) return 'Unknown'
  const d = date.toDate ? date.toDate() : new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.admin-page {
  padding: var(--space-2xl) 0;
  min-height: calc(100vh - 64px - 280px);
}

.admin-header {
  margin-bottom: var(--space-2xl);
}

.loading-container {
  text-align: center;
  padding: var(--space-3xl) 0;
}

.alert {
  padding: var(--space-md) var(--space-lg);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-xl);
}

.alert-error {
  background-color: var(--color-error);
  color: white;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
  flex-wrap: wrap;
  gap: var(--space-md);
}

.search-box {
  position: relative;
  width: 300px;
}

.search-icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text-tertiary);
}

.search-input {
  padding-left: calc(var(--space-md) * 3);
}

.table-container {
  overflow-x: auto;
  margin-bottom: var(--space-2xl);
}

.users-table {
  width: 100%;
  border-collapse: collapse;
}

.users-table th {
  text-align: left;
  padding: var(--space-md) var(--space-lg);
  font-weight: var(--font-semibold);
  color: var(--color-text-secondary);
  border-bottom: 2px solid var(--color-border);
  font-size: var(--text-sm);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.users-table td {
  padding: var(--space-md) var(--space-lg);
  border-bottom: 1px solid var(--color-border-light);
}

.users-table tbody tr:hover {
  background-color: var(--color-bg-secondary);
}

.user-info {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.user-avatar {
  width: 32px;
  height: 32px;
  background-color: var(--color-primary);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-sm);
  font-weight: var(--font-semibold);
  flex-shrink: 0;
}

.role-badge {
  padding: var(--space-xs) var(--space-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.role-admin {
  background-color: var(--color-primary-light);
  color: var(--color-primary);
}

.role-user {
  background-color: var(--color-bg-secondary);
  color: var(--color-text-secondary);
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--space-lg);
}

.stat-card {
  padding: var(--space-lg);
  text-align: center;
}

.stat-value {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-primary);
  margin-bottom: var(--space-xs);
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Utilities */
.mr-xs {
  margin-right: var(--space-xs);
}

.mr-sm {
  margin-right: var(--space-sm);
}

.mt-sm {
  margin-top: var(--space-sm);
}

.mt-md {
  margin-top: var(--space-md);
}

/* Mobile Responsive */
@media (max-width: 768px) {
  .search-box {
    width: 100%;
  }
  
  .users-table {
    font-size: var(--text-sm);
  }
  
  .users-table th,
  .users-table td {
    padding: var(--space-sm) var(--space-md);
  }
  
  .user-info span {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  
  .btn-sm {
    font-size: var(--text-xs);
    padding: var(--space-xs) var(--space-sm);
  }
}
</style>