// main.js
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

// Import your CSS
import './assets/main.css'

// FontAwesome imports
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

// Import the icons you need from free-solid-svg-icons
import { 
  faCloudUploadAlt,
  faClipboard,
  faFile,
  faFileCode,
  faCheckCircle,
  faExclamationCircle,
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
  faSignOutAlt
} from '@fortawesome/free-solid-svg-icons'

// Import brand icons
import {
  faJs,
  faPython,
  faPhp,
  faGithub,
  faNode,
  faLinkedin
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
  // Brand icons
  faJs,
  faPython,
  faPhp,
  faGithub,
  faNode,
  faLinkedin
)

const app = createApp(App)

// Register FontAwesome component globally
app.component('font-awesome-icon', FontAwesomeIcon)

app.use(router)

app.mount('#app')