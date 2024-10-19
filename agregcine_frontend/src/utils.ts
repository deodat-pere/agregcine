import { MovieProps } from "./Album"

export function get_image(image_link: string): string {
    if (image_link.length == 0) {
        return "https://fr.web.img3.acsta.net/commons/v9/common/empty/empty_portrait.png"
    } else {
        return image_link
    }
}

export const default_movie_props: MovieProps = {
    name: "",
    runtime: "",
    summary: "",
    image_link: "",
    release_date: "",
    id: 0,
} 