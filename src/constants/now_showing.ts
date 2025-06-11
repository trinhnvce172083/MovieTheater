import { imageConfigDefault } from "next/dist/shared/lib/image-config";

export interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  releaseDate: string;
  genre: string;
  rating: string;
  description: string;
}

const NOW_SHOWING = [
  {
    id: 1,
    title: "DORAEMON: NOBITA'S ART WORLD TALES",
    posterUrl: "https://res.cloudinary.com/dltuc4zjz/image/upload/v1749560503/Doraemon_Nobita_Art_World_Tales_t405ur.jpg",
    releaseDate: "2025-05-23",
    genre: "Family",
    rating: "P",
    description: "Join Doraemon and friends on their latest adventure.",
  },
  {
    id: 2,
    title: "LILO & STITCH",
    posterUrl: "https://res.cloudinary.com/dltuc4zjz/image/upload/v1749560504/Lilo_and_Stitch_evyon7.png" ,
    releaseDate: "2025-05-23",
    genre: "Family",
    rating: "P",
    description:
      "The live-action version of the Disney animated film of the same name. The movie follows a lonely Hawaiian girl who befriends an escaped alien, helping to repair her broken family.",
  },
  {
    id: 3,
    title: "MISSION IMPOSSIBLE: DEADLY RECKONING",
    posterUrl: "https://res.cloudinary.com/dltuc4zjz/image/upload/v1749560504/Mission_impossible_acpvfj.jpg",
    releaseDate: "2025-05-30",
    genre: "Action",
    rating: "T16",
    description:
      "Ethan Hunt returns for another impossible mission to save the world.",
  },
  {
    id: 4,
    title: "THE STONE",
    posterUrl: "https://res.cloudinary.com/dltuc4zjz/image/upload/v1749560535/The_Stone_lyyk0c.webp",
    releaseDate: "2025-05-23",
    genre: "Drama",
    rating: "T16",
    description: "When Ake desperately needs money to pay for his gravely ill father's medical treatment, he takes his father's sacred amulet to be appraised by the renowned expert Seng Paradise.",
  }
];


export default NOW_SHOWING;
