const TOKEN_KEY = 'mps_token';
const CLAIMS_KEY = 'mps_claims';
export function setToken(token) {
    if (typeof localStorage === 'undefined')
        return;
    localStorage.setItem(TOKEN_KEY, token);
}
export function getToken() {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null;
}
export function setClaims(claims) {
    if (typeof localStorage === 'undefined')
        return;
    localStorage.setItem(CLAIMS_KEY, JSON.stringify(claims));
    const modeVal = claims.mode === 'Supplier' ? 'supplier' : 'client';
    localStorage.setItem('mpsone_user_type', modeVal);
    localStorage.setItem('mpsone_role', claims.role);
    localStorage.setItem('mpsone_user_id', claims.userId);
}
export function getClaims() {
    if (typeof localStorage === 'undefined')
        return null;
    try {
        return JSON.parse(localStorage.getItem(CLAIMS_KEY) || 'null');
    }
    catch {
        return null;
    }
}
export function setMode(mode) {
    if (typeof localStorage === 'undefined')
        return;
    const val = mode === 'Supplier' ? 'supplier' : 'client';
    localStorage.setItem('mpsone_user_type', val);
}
