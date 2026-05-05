import { IDedSeance } from "./TimelinePage/TimelinePage";

const SELECTED_KEY = 'selectedProfile';
const PROFILES_KEY = 'userProfiles';

/**
 * Deep comparison of two IDedSeance objects.
 * @param a first seance
 * @param b second seance
 * @returns true if all fields are equal
 */
function areSeancesEqual(a: IDedSeance, b: IDedSeance): boolean {
    // Compare id
    if (a.movie_id !== b.movie_id) return false;
    // Compare nested seance fields
    const aSe = a.seance;
    const bSe = b.seance;
    // Assuming ShowingProps has primitive fields; perform shallow comparison
    const keys = Object.keys(aSe) as (keyof typeof aSe)[];
    for (const key of keys) {
        if (aSe[key] !== bSe[key]) return false;
    }
    return true;
}

export type FavoriteMovie = {
    name: string;
    ttl: string;
};

export type Profile = {
    name: string,
    cinemas: string[],
    favorites: FavoriteMovie[],
    bookmarks: IDedSeance[]
}

export function getSelectedProfile(): string | null {
    return localStorage.getItem(SELECTED_KEY);
}

export function setSelectedProfile(profileName: string): void {
    localStorage.setItem(SELECTED_KEY, profileName);
}

/**
 * Retrieves all profiles from localStorage.
 * @returns {Profile[]} An array of profiles, or an empty array if none exist.
 */
export function getAllProfiles(): Profile[] {
    const data = localStorage.getItem(PROFILES_KEY);
    return data ? JSON.parse(data) as Profile[] : [];
}

export function addProfile(profile: Profile): void {
    const profiles = getAllProfiles();
    const index = profiles.findIndex(p => p.name === profile.name);
    if (index >= 0) {
        profiles[index] = profile;
    } else {
        profiles.push(profile);
    }
    localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function deleteProfile(profileName: string): void {
    const profiles = getAllProfiles();
    const filtered = profiles.filter(p => p.name !== profileName);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(filtered));
}

export function getProfile(profileName: string): Profile | null {
    const profiles = getAllProfiles();
    const profile = profiles.find(p => p.name === profileName);
    if (!profile) return null;

    // Remove favorites whose ttl has passed
    if (profile.favorites) {
        const now = new Date();
        const filtered = profile.favorites.filter(f => new Date(f.ttl) > now);
        if (filtered.length !== profile.favorites.length) {
            profile.favorites = filtered;
            addProfile(profile);
        }
    }
    // Remove bookmarks whose ttl has passed
    if (profile.bookmarks) {
        const now = new Date();
        const filtered = profile.bookmarks.filter(b => new Date(b.seance.time) > now);
        if (filtered.length !== profile.bookmarks.length) {
            profile.bookmarks = filtered;
            addProfile(profile)
        }
    }
    return profile;
}

/**
 * Toggles a movie in the favorites list of a profile.
 * If the movie is already a favorite, it will be removed; otherwise it will be added with a TTL of 3 months from now.
 * @param profileName - The name of the profile to update.
 * @param movieName - The movie to toggle in favorites.
 */
export function toggleFavorites(profileName: string, movieName: string, state: boolean): void {
    const profile = getProfile(profileName);
    if (!profile) return;
    if (!profile.favorites) profile.favorites = [];
    const index = profile.favorites.findIndex(f => f.name === movieName);
    if (!state) {
        profile.favorites.splice(index, 1);
    } else if (index < 0){
        const ttlDate = new Date();
        ttlDate.setMonth(ttlDate.getMonth() + 3);
        profile.favorites.push({ name: movieName, ttl: ttlDate.toISOString() });
    }
    addProfile(profile); // persist updated profile
}

/**
 * Checks whether a given movie is in the favorites list of a profile.
 * @param profileName - The name of the profile to check.
 * @param movieName - The movie to look for in favorites.
 * @returns {boolean} true if the movie is a favorite, false otherwise.
 */
export function isFavorite(profileName: string, movieName: string): boolean {
    const profile = getProfile(profileName);
    if (!profile || !profile.favorites) return false;
    return profile.favorites.some(f => f.name === movieName);
}


/**
 * Checks whether a given IDedSeance is in the bookmarks list of a profile.
 * @param profileName - The name of the profile to check.
 * @param seance - The seance to look for in bookmarks.
 * @returns {boolean} true if the seance is bookmarked, false otherwise.
 */
export function isBookmarked(profileName: string, seance: IDedSeance): boolean {
    const profile = getProfile(profileName);
    if (!profile || !profile.bookmarks) return false;
    return profile.bookmarks.some(b => areSeancesEqual(b, seance));
}

/**
 * Toggles a bookmark in the bookmarks list of a profile.
 * If the seance is already bookmarked, it will be removed; otherwise it will be added with a TTL of one week from now.
 * @param profileName - The name of the profile to update.
 * @param seance - The seance to toggle in bookmarks.
 * @param state - If true, add the bookmark; if false, remove it.
 */
export function toggleBookmark(profileName: string, seance: IDedSeance, state: boolean): void {
    const profile = getProfile(profileName);
    if (!profile) return;
    if (!profile.bookmarks) profile.bookmarks = [];
    const index = profile.bookmarks.findIndex(b => areSeancesEqual(b, seance));
    if (!state) {
        // remove existing bookmark if present
        if (index >= 0) profile.bookmarks.splice(index, 1);
    } else {
        // add bookmark if not present
        if (index < 0) {
            const ttlDate = new Date();
            ttlDate.setDate(ttlDate.getDate() + 7);
            profile.bookmarks.push(seance);
        }
    }
    addProfile(profile); // persist updated profile
}

