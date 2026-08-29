import axios from "axios";
import { env } from "./env";

export const bunnyApi = axios.create({
  baseURL: `https://video.bunnycdn.com/library/${env.BUNNY_STREAM_LIBRARY_ID}`,
  headers: {
    AccessKey: env.BUNNY_STREAM_API_KEY,
    accept: "application/json",
  },
});

export const BUNNY_TUS_ENDPOINT = "https://video.bunnycdn.com/tusupload";
