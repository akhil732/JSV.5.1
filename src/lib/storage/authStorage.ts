export const setSessionToken = (token: string) => {
    localStorage.setItem('auth_token', token);
};

export const getSessionToken = () => localStorage.getItem('auth_token');

export const clearSessionToken = () => {
    localStorage.removeItem('auth_token');
};
