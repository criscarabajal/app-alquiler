// Auth module - Public API

export {
    isAuthenticated,
    login,
    logout,
    getCurrentUser,
    setCurrentUser,
    getLoggedUsersList,
    switchUser
} from './services/auth.service.js';
