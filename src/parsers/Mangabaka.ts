import { capitalizeTags, stripHtmlTags } from '@/main'
import { MangaInfo, type ParserOptions, type Searcher, type TachiStatus } from '@/types'
import type { MangaResponse, SearchResponse } from './MangabakaType'

const statusMap = {
  completed: 'Completed',
  releasing: 'Ongoing',
  unknown: 'Unknown',
  cancelled: 'Cancelled',
  hiatus: 'On hiatus',
  upcoming: 'Unknown',
}

export function MangaBaka(): Searcher
export function MangaBaka(url?: string, options?: ParserOptions): Searcher
export function MangaBaka(url: string = '', options: ParserOptions = {}): Searcher {
  const source =
    // [
    { name: 'MangaBaka', url: 'https://mangabaka.dev', icon: 'mb.png' }
  // { name: 'MangaDex', url: 'mangadex.org', icon: 'md.png' },
  //]
  const apiUrl = 'https://api.mangabaka.dev'
  const urlRE =
    new RegExp('^(?<protocol>https?://)?' + source.url.slice(8) + '/(?<id>\\d+)').exec(url)
      ?.groups || {}

  return {
    name: source.name, // source.map(s => s.name),
    url: source.url, // source.map(s => `https://${s.url}`),
    icon: source.icon, // source.map(s => s.icon),
    sources: [source, { name: 'MangaDex', url: 'https://mangadex.org', icon: 'md.png' }],
    validateUrl: () => Boolean(urlRE?.id),
    parse: async () => {
      if (!urlRE)
        if (!DEV)
          return new Promise(() => {
            return { error: 'Invalid URL' }
          })

      const page = await fetch(
        DEV
          ? urlRE.id
            ? `${apiUrl}/v1/series/${urlRE.id}`
            : 'src/dev/mangabaka.json'
          : `${apiUrl}/v1/series/${urlRE.id}/full`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(response => response.json() as Promise<MangaResponse>)
        .then(parsed => parsed.data || { error: parsed.message })
        .catch(e => {
          console.error(e)
          return { error: String(e) }
        })
      if ('error' in page) return [page as MangaInfo]

      const data = new MangaInfo({
        source: source,
        title: options.english ? page.title : page.romanized_title || page.native_title,
        genre: [
          ...(page.genres || []).map(g => capitalizeTags(g)).sort(),
          ...(page.tags || []).sort(),
        ],
        artist: page.artists,
        author: page.authors,
        cover: page.cover.default,
        status: statusMap[page.status] as TachiStatus,
        publisher: page.publishers?.map(p => p.name).join(', '),
        description: page.description,
        url: (page.links || []).join(' '),
      })
      if (page.description) {
        data.description = stripHtmlTags(page.description)
      }
      // if (page.synonyms.length > 0) {
      data.description +=
        `\n\nAlternate titles:\n- ` +
        [
          ...new Set([
            page.title,
            page.romanized_title,
            page.native_title,
            ...Object.values(page.secondary_titles).flatMap(o => o.map(e => e.title)),
          ]),
        ]
          .filter(t => t != data.title)
          .join('\n- ')
      // }
      if (page.year) data.date = `${page.year}-01-01`
      return [data]
    },
    search: async (query: string) => {
      const page = await fetch(
        `${apiUrl}/v1/series/search?` +
          new URLSearchParams(
            ['safe', 'suggestive', 'erotica', 'pornographic']
              .map(r => ['content_rating', r])
              .concat([['q', query]]),
          ),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(response => response.json() as Promise<SearchResponse>)
        .then(parsed => parsed.data || { error: parsed.message })
        .catch(e => {
          console.error(e)
          return { error: String(e) }
        })
      if ('error' in page) return [page as MangaInfo]

      const data = page.map(parsed => {
        const manga = new MangaInfo({
          title: options.english ? parsed.title : parsed.romanized_title || parsed.native_title,
          artist: parsed.artists,
          author: parsed.authors,
          cover: parsed.cover.small || parsed.cover.default,
          status: statusMap[parsed.status] as TachiStatus,
          publisher: parsed.publishers?.map(p => p.name).join(', '),
        })
        if (parsed.year) manga.date = `${parsed.year}-01-01`
        return manga
      })
      return data
    },
  }
}
