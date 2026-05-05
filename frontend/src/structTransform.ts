import { MovieProps } from './HomePage/Album';
import { ShowingProps } from './MoviePage/ShowingsList';
import { IDedSeance } from './TimelinePage/TimelinePage';

// URL of the remote JSON
const MOVIES_URL = 'https://raw.githubusercontent.com/deodat-pere/deodat-pere.github.io/refs/heads/gh-pages/assets/movies.json';

// Holds the parsed data once loaded as a dictionary keyed by movie id
let orderedMovies: Record<string, { movie: MovieProps; dates: ShowingProps[] }> | null = null;

type FetchedType = {
    movies: Array<{
        movie: { 
          id: string;
            runtime: string;
            name: string;
            summary: string;
            image_link: string;
            release_date: string;
            is_new: boolean;
            is_premiere: boolean;
            is_unique: boolean;
            rating: number;
            genres: string[]; 
        },
        dates: ShowingProps[],
    }>
}

/**
 * Load movies from the remote URL and populate `orderedMovies`.
 * Call this once before using any other exported functions.
 */
export async function loadMovies(): Promise<void> {
  
  const response = await fetch(MOVIES_URL);
  const json: FetchedType = await response.json();
  const dict: Record<string, { movie: MovieProps; dates: ShowingProps[] }> = {};
  json.movies.forEach(el => {
    const cinemas = Array.from(new Set(el.dates.map(d => d.cine)));
    dict[el.movie.id] = {
      movie: { ...el.movie, cinemas } as MovieProps,
      dates: el.dates,
    };
  });
  orderedMovies = dict;
}

/**
 * Helper to ensure data is loaded before accessing it.
 */
function ensureLoaded(): void {
  if (!orderedMovies) {
    throw new Error('Movies not loaded. Call loadMovies() first.');
  }
}

export function getMovies(): Record<string, MovieProps> {
  ensureLoaded();
  const result: Record<string, MovieProps> = {};
  Object.entries(orderedMovies!).forEach(([id, val]) => {
    result[id] = val.movie;
  });
  return result;
}

export function movieById(id: string): MovieProps {
  ensureLoaded();
  return orderedMovies![id].movie;
}

export function seanceById(id: string): ShowingProps[] {
  ensureLoaded();
  return orderedMovies![id].dates;
}

export function getSeances(): IDedSeance[] {
  ensureLoaded();
  const seances: IDedSeance[] = [];
  Object.values(orderedMovies!).forEach(element => {
    element.dates.forEach(seance => {
      seances.push({
        movie_id: element.movie.id,
        seance,
      });
    });
  });
  return seances;
}

export function getLocations(): string[] {
  ensureLoaded();
  const locations = new Set<string>();
  Object.values(orderedMovies!).map(movie => {
    movie.dates.forEach(date => {
      locations.add(date.cine);
    });
  });
  return Array.from(locations);
}