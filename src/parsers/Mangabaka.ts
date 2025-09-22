import { stripHtmlTags } from '@/main'
import { MangaInfo, type Parser, type ParserOptions, type TachiStatus } from '@/types'
import type { MangaResponse } from './MangabakaType'

const statusMap = {
  completed: 'Completed',
  releasing: 'Ongoing',
  unknown: 'Unknown',
  cancelled: 'Cancelled',
  hiatus: 'On hiatus',
  upcoming: 'Unknown',
}

export function MangaBaka(url?: string, options?: ParserOptions): Parser
export function MangaBaka(url: string = '', options: ParserOptions = {}): Parser {
  const source =
    // [
    { name: 'MangaBaka', url: 'mangabaka.dev', icon: 'mb.png' }
  // { name: 'MangaDex', url: 'mangadex.org', icon: 'md.png' },
  //]
  const apiUrl = 'https://api.mangabaka.dev'
  const urlRE =
    new RegExp('^(?<protocol>https?://)?' + source.url + '/(?<id>\\d+)').exec(url)?.groups || {}

  return {
    name: source.name, // source.map(s => s.name),
    url: `https://${source.url}`, // source.map(s => `https://${s.url}`),
    icon: source.icon, // source.map(s => s.icon),
    sources: [source, { name: 'MangaDex', url: 'mangadex.org', icon: 'md.png' }],
    validateUrl: () => Boolean(urlRE?.id),
    parse: async () => {
      if (!urlRE)
        if (!DEV)
          return new Promise(() => {
            return { error: 'Invalid URL' }
          })

      const page = await fetch(
        DEV
          ? // ? urlRE.id
            // ? `${apiUrl}/v1/series/${urlRE.id}`
            'src/dev/mangabaka.json'
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
          ...(page.genres || []).map(
            g => g.replace('_', ' ').charAt(0).toUpperCase() + g.substring(1),
          ),
          ...(page.tags || []),
        ],
        artist: page.artists,
        author: page.authors,
        cover: page.cover.default,
        status: statusMap[page.status] as TachiStatus,
        publisher: page.publishers.map(p => p.name).join(', '),
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
  }
}
