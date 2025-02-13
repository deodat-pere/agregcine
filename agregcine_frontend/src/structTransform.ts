import moviesJson from '../../agregcine_backend/movies.json'
import { MovieProps } from './HomePage/Album';
import { ShowingProps } from './MoviePage/ShowingsList';
import { IDedSeance } from './TimelinePage/TimelinePage';

const orderedMovies= structuredClone(moviesJson.movies).sort((a,b) => (a.movie.id - b.movie.id))

export function getMovies(): MovieProps[] {
    var movies: MovieProps[] = []
    orderedMovies.forEach(element => {
        movies.push(element.movie)
    });
    return movies
}

export function movieById(id: number): MovieProps {
    return orderedMovies[id].movie
}

export function seanceById(id:number): ShowingProps[] {
    return orderedMovies[id].dates
}

export function getSeances(): IDedSeance[] {
    var seances: IDedSeance[] = [];
    orderedMovies.forEach(element => {
        element.dates.forEach(seance => {
            seances.push({
                id: element.movie.id,
                seance: seance
            })
        })
    })
    return seances
}