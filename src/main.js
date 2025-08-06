// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import CSS
import './assets/main.css'

// FontAwesome imports
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import solid icons
import { 
  faCloudUploadAlt,
  faClipboard,
  faFile,
  faFileCode,
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faSpinner,
  faTimes,
  faTrash,
  faDownload,
  faCode,
  faExternalLinkAlt,
  faCheck,
  faWrench,
  faSun,
  faMoon,
  faDesktop,
  faChevronDown,
  faBars,
  faSignInAlt,
  faSearch,
  faPlus,
  faFrown,
  faArrowUp,
  faComment,
  faCopy,
  faChevronLeft,
  faChevronRight,
  faTrophy,
  faMicrophone,
  faLightbulb,
  faUsers,
  faEnvelope,
  faSignOutAlt,
  faLink,
  faSave,
  faShare,
  faEdit,
  faClock,
  faCodeBranch,
  faRocket,
  faInfoCircle,
  faKey,
  faCog,
  faUser,
  faHome
} from '@fortawesome/free-solid-svg-icons'

// Import brand icons
import {
  faJs,
  faPython,
  faPhp,
  faGithub,
  faNode,
  faLinkedin,
  faGoogle
} from '@fortawesome/free-brands-svg-icons'

// Add icons to the library
library.add(
  // Solid icons
  faCloudUploadAlt,
  faClipboard,
  faFile,
  faFileCode,
  faCheckCircle,
  faExclamationCircle,
  faExclamationTriangle,
  faSpinner,
  faTimes,
  faTrash,
  faDownload,
  faCode,
  faExternalLinkAlt,
  faCheck,
  faWrench,
  faSun,
  faMoon,
  faDesktop,
  faChevronDown,
  faBars,
  faSignInAlt,
  faSearch,
  faPlus,
  faFrown,
  faArrowUp,
  faComment,
  faCopy,
  faChevronLeft,
  faChevronRight,
  faTrophy,
  faMicrophone,
  faLightbulb,
  faUsers,
  faEnvelope,
  faSignOutAlt,
  faLink,
  faSave,
  faShare,
  faEdit,
  faClock,        // Added for migration timeline
  faCodeBranch,   // Added for breaking changes
  faRocket,       // Added for solution highlight
  faInfoCircle,   // Added for info messages
  faKey,          // Added for API keys
  faCog,          // Added for settings
  faUser,         // Added for user profile
  faHome,         // Added for navigation
  // Brand icons
  faJs,
  faPython,
  faPhp,
  faGithub,
  faNode,
  faLinkedin,
  faGoogle        // Added for Google OAuth
)

const app = createApp(App)

// Register FontAwesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)

app.mount('#app')