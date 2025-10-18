import { blankLine, capitalizeTags, DEV, replaceSmartQuotes, stripHtmlTags } from '@/main'
import type { MangaResponse, SearchResponse, SeriesData } from '@/parsers/MangabakaType'
import { MangaInfo, type ParserOptions, type Searcher, type TachiStatus } from '@/types'

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
            return new MangaInfo({ error: 'Invalid URL' })
          })

      const page = await fetch(
        DEV
          ? urlRE.id
            ? `${apiUrl}/v1/series/${urlRE.id}/full`
            : 'src/dev/mangabaka.json'
          : `${apiUrl}/v1/series/${urlRE.id}/full`,
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(response => response.text())
        .then(
          txt =>
            JSON.parse(txt, (_, v) =>
              typeof v == 'string' ? replaceSmartQuotes(v) : v,
            ) as Promise<MangaResponse>,
        )
        .then(parsed => parsed.data || { error: String(parsed.message) })
        .catch(e => {
          console.error(e)
          return { error: String(e) }
        })
      if ('error' in page) return [new MangaInfo(page)]

      return [buildInfo(page)]
    },
    search: async (query: string) => {
      const page = await fetch(
        `${apiUrl}/v1/series/search?` +
          new URLSearchParams(
            [
              ['q', query],
              ['type_not', 'novel'],
            ].concat(
              ['safe', 'suggestive', 'erotica', 'pornographic'].map(r => ['content_rating', r]),
            ),
          ),
        {
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        },
      )
        .then(response => response.text())
        .then(
          txt =>
            JSON.parse(txt, (_, v) =>
              typeof v == 'string' ? replaceSmartQuotes(v) : v,
            ) as Promise<SearchResponse>,
        )
        .then(parsed => parsed.data || { error: parsed.message })
        .catch(e => {
          console.error(e)
          return { error: String(e) }
        })
      if ('error' in page) throw new Error(page.error)

      return page.map(parsed => Object({ parsed: buildInfo(parsed), raw: parsed }))
    },
  }

  function buildInfo(page: SeriesData) {
    const info = new MangaInfo({
      source: source,
      title:
        (options.english
          ? page.title || page.romanized_title
          : page.romanized_title || page.title) || page.native_title,
      genre: [
        ...(page.genres || [])
          .sort()
          .map(g => (options.groupTags ? 'Genre:' : '') + capitalizeTags(g)),
        ...(page.tags || []).sort().map(t => (options.groupTags ? 'Tag:' : '') + t),
      ],
      artist: page.artists,
      author: page.authors,
      cover: page.cover.raw || page.cover.default,
      status: statusMap[page.status] as TachiStatus,
      publisher: page.publishers?.map(p => p.name).join(', '),
      description: page.description,
      url: (page.links || []).join(' '),
    })
    const description = []
    const descriptionHeader = []
    if (page.rating) {
      const stars = Math.min(Number((page.rating / (page.rating < 10 ? 2 : 20)).toFixed()), 5)
      descriptionHeader.push(
        '★'.repeat(stars) +
          '☆'.repeat(5 - stars) +
          ` ${(page.rating < 10 ? page.rating : page.rating / 10).toFixed(1)}`,
      )
    }
    if (page.is_licensed) descriptionHeader.push('💱 Licensed')
    if (page.has_anime)
      descriptionHeader.push(
        '📺' +
          (page.anime?.start ? ` From: ${page.anime.start} ` : '') +
          (page.anime?.end ? `To: ${page.anime.end}` : page.anime?.start ? '?' : ''),
      )
    if (descriptionHeader.length > 0) {
      description.push(descriptionHeader.join(' ') + '\n')
    }

    if (page.description) description.push(stripHtmlTags(page.description))

    const altTitles = [
      ...new Set([
        page.title,
        page.romanized_title,
        page.native_title,
        ...Object.values(page.secondary_titles).flatMap(o => o?.map(e => e.title)),
      ]),
    ].filter(t => t != info.title)
    if (altTitles.length > 0) {
      description.push('')
      description.push('Alternate titles:\n' + altTitles.map(t => `  - ${t}`).join('\n'))
    }

    info.description = description.join(blankLine)

    if (page.year) info.date = `${page.year}-01-01`
    return info
  }
}
