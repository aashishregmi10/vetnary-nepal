import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: "PawMart",
    description: SITE.description,
    start_url: "/",
    display: "standalone",
    background_color: "#f4f5f7",
    theme_color: "#1a73e8",
    icons: [],
  };
}
