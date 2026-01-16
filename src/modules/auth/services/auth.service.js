/**
 * Auth Service - Manages user authentication and session
 * Handles login, logout, user switching, and session persistence
 */

// Keys for localStorage
const AUTH_KEY = "seguiRodandoAuth"; // Marca si hay sesión activa
const CURRENT_USER_KEY = "currentUser"; // Usuario actual logueado
const USERS_LIST_KEY = "usuariosLogueados"; // Historial de usuarios

/** @type {import('../types/auth.types').UserCredentials[]} */
// Lista de usuarios válidos (en producción esto vendría de una base de datos)
const USERS = [
    { user: "cris", pass: "prueba1234" },
];

/**
 * Verifica si hay un usuario autenticado actualmente
 * @returns {boolean} true si hay sesión activa, false si no
 */
export function isAuthenticated() {
    return localStorage.getItem(AUTH_KEY) === "ok";
}

/**
 * Intenta autenticar un usuario con credenciales
 * @param {string} username - Nombre de usuario
 * @param {string} password - Contraseña
 * @returns {import('../types/auth.types').LoginResult} Resultado del login
 */
export function login(username, password) {
    // Buscar usuario en la lista de usuarios válidos
    const encontrado = USERS.find(
        (u) => u.user === username && u.pass === password
    );

    if (encontrado) {
        // Guardar estado de autenticación
        localStorage.setItem(AUTH_KEY, "ok");
        return { ok: true };
    }

    // Credenciales inválidas
    return {
        ok: false,
        error: "Escribí bien la contraseña pedazo de manco",
    };
}

/**
 * Cierra la sesión del usuario actual
 * Limpia tanto el estado de autenticación como el usuario actual
 */
export function logout() {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(CURRENT_USER_KEY);
}

/**
 * Obtiene el nombre del usuario actualmente logueado
 * @returns {string|null} Nombre de usuario o null si no hay sesión
 */
export function getCurrentUser() {
    return localStorage.getItem(CURRENT_USER_KEY);
}

/**
 * Establece el usuario actual y lo agrega al historial
 * @param {string} username - Nombre de usuario a establecer
 */
export function setCurrentUser(username) {
    localStorage.setItem(CURRENT_USER_KEY, username);

    // Actualizar historial de usuarios logueados
    const lista = JSON.parse(localStorage.getItem(USERS_LIST_KEY) || "[]");
    if (!lista.includes(username)) {
        lista.push(username);
        localStorage.setItem(USERS_LIST_KEY, JSON.stringify(lista));
    }
}

/**
 * Obtiene la lista de todos los usuarios que han iniciado sesión
 * @returns {string[]} Array de nombres de usuario
 */
export function getLoggedUsersList() {
    return JSON.parse(localStorage.getItem(USERS_LIST_KEY) || "[]");
}

/**
 * Cambia al siguiente usuario en el ciclo de usuarios logueados
 * Permite cambiar entre usuarios sin hacer logout
 * @param {string} currentUsername - Usuario actual
 * @returns {string|null} Siguiente usuario en el ciclo, o null si hay que hacer logout
 */
export function switchUser(currentUsername) {
    const lista = getLoggedUsersList();

    // Si solo hay un usuario, no se puede cambiar - requiere logout
    if (lista.length < 2) {
        return null;
    }

    // Ciclo circular: encuentra posición actual y salta al siguiente
    const pos = lista.indexOf(currentUsername);
    const siguiente = lista[(pos + 1) % lista.length]; // % para wrap-around

    return siguiente;
}
