export interface ItunesEpisode {
  trackId: number;
  trackName: string;
  description: string;
  releaseDate: string;
  trackTimeMillis: number;
  episodeUrl: string;
  trackViewUrl: string;
  artworkUrl600: string;
}

export async function fetchItunesEpisodes(): Promise<ItunesEpisode[]> {
  // Fetch 20 so the podcast show entry (result[0]) doesn't eat into our quota
  const res = await fetch(
    "https://itunes.apple.com/lookup?id=1726048251&entity=podcastEpisode&limit=20",
    { cache: "no-store" }
  );
  if (!res.ok) throw new Error(`iTunes API error: ${res.status}`);
  const data = await res.json() as { results: Array<Record<string, unknown>> };

  return data.results
    .filter(
      (r) => r.wrapperType === "podcastEpisode" || r.kind === "podcast-episode"
    )
    .slice(0, 5) as unknown as ItunesEpisode[];
}
