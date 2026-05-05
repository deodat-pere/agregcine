import { MovieProps } from "./HomePage/Album"

export function get_image(image_link: string): string {
    if (image_link.length == 0) {
        return "https://fr.web.img3.acsta.net/commons/v9/common/empty/empty_portrait.png"
    } else {
        return image_link
    }
}

export const not_found_movie_props: MovieProps = {
    name: "",
    runtime: "",
    summary: "",
    image_link: "",
    release_date: "",
    id: "fakeMovie",
    is_new: false,
    is_premiere: false,
    is_unique: false,
    rating: 0,
    genres: [],
    cinemas: []
} 

export function small_date(s: string) {
    const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const b = s.split(/\D+/);
    const date = new Date(Date.UTC(Number(b[0]), Number(b[1]) - 1, Number(b[2])));

    const date_pretty = jours[date.getDay()] + " " + date.getDate();
    return date_pretty;
}

export function parse_date(s: string) {
    const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];
    const mois = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
    const b = s.split(/\D+/);
    const date = new Date(Date.UTC(Number(b[0]), Number(b[1]) - 1, Number(b[2])));

    const date_pretty = jours[date.getDay()] + " " + date.getDate() + " " + mois[date.getMonth()];
    return [date.toISOString(), date_pretty];
}

export function parse_hour(s: string): string {
    return s.slice(11, 13) + "h" + s.slice(14, 16)
}