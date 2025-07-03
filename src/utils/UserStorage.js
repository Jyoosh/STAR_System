const USERS_KEY = 'users';
const CURRENT_USER_KEY = 'currentUser';

// Get all registered users
export const getUsers = () => {
  return JSON.parse(localStorage.getItem(USERS_KEY)) || [];
};

// Save a new user
export const saveUser = (user) => {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

// Authenticate user
export const authenticateUser = (email, password, role) => {
  const users = getUsers();
  return users.find(
    (u) => u.email === email && u.password === password && u.role === role
  );
};

// Save current session user
export const setCurrentUser = (user) => {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

// Get current logged-in user
export const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem(CURRENT_USER_KEY));
};

// Remove session
export const clearCurrentUser = () => {
  localStorage.removeItem(CURRENT_USER_KEY);
};
