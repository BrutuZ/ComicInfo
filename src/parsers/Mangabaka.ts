import { blankLine, capitalizeTags, DEV, replaceSmartQuotes, stripHtmlTags } from '@/main'
import type {
  MangaResponse,
  SearchResponse,
  SeriesData,
  SourceAnilist,
  SourceMal,
  SourceNames,
  SourcesType,
} from '@/parsers/MangabakaType'
import { MangaInfo, type ParserOptions, type Searcher, type TachiStatus } from '@/types'

const statusMap = {
  completed: 'Completed',
  releasing: 'Ongoing',
  unknown: 'Unknown',
  cancelled: 'Cancelled',
  hiatus: 'On hiatus',
  upcoming: 'Unknown',
}

const sourceUrlMap: { [k in SourceNames]: string } = {
  anilist: 'https://anilist.co/manga/',
  anime_planet: 'https://www.anime-planet.com/manga/',
  anime_news_network: 'https://www.animenewsnetwork.com/encyclopedia/manga.php?id=',
  kitsu: 'https://kitsu.app/manga/',
  manga_updates: 'https://www.mangaupdates.com/series/',
  my_anime_list: 'https://myanimelist.net/manga/',
  shikimori: 'https://shikimori.one/mangas/',
}

const animeRE = /Vol(ume|\.)? \d+, Ch(\.|ap(ter)?) /

export function MangaBaka(): Searcher
export function MangaBaka(url?: string, options?: ParserOptions): Searcher
export function MangaBaka(url: string = '', options: ParserOptions = {}): Searcher {
  const source = { name: 'MangaBaka', url: 'https://mangabaka.org', icon: 'mb.png' }
  const apiUrl = 'https://api.mangabaka.dev'
  const urlRE =
    new RegExp('(?<protocol>https?://)?' + source.url.slice(8) + '/(?<id>\\d+)').exec(url)
      ?.groups || {}

  return {
    name: source.name, // source.map(s => s.name),
    url: source.url, // source.map(s => `https://${s.url}`),
    icon: source.icon, // source.map(s => s.icon),
    sources: [source],
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
      cover: page.cover.raw?.url || page.cover.x350?.x1,
      status: statusMap[page.status] as TachiStatus,
      publisher: page.publishers?.map(p => p.name).join(', '),
      description: page.description,
      url: ([...new Set([
        `${source.url}/${page.id}`,
        ...Object.entries(page.source as SourcesType)
          .map(s => { if (s[0] in sourceUrlMap && s[1]?.id) return `${sourceUrlMap[s[0] as SourceNames]}${s[1].id}` }),
        ...(page.links || []),
      ])].filter(u => u)).join(' '),
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
    if (page.is_licensed && options.showLicensed) descriptionHeader.push('💱 Licensed')
    if (page.has_anime && page.anime) {
      const animeEps: string[] = []
      page.anime.start
        .split('/')
        .forEach((season, index) =>
          animeEps.push(
            season.replace(animeRE, 'Ch.').trim() +
            '-' +
            (page.anime.end?.split('/')[index]?.replace(animeRE, '').trim() || '?'),
          ),
        )
      descriptionHeader.push('📺' + animeEps.join(', '))
    }
    if (descriptionHeader.length > 0) {
      description.push(descriptionHeader.join(' | ') + '\n')
    }

    if (page.description) description.push(stripHtmlTags(page.description))

    const altTitles = [
      ...new Set([
        page.title,
        page.romanized_title,
        page.native_title,
        ...Object.values(page.secondary_titles).flatMap(o => o?.map(e => e.title)),
        ...Object.values((page.source.anilist as SourceAnilist)?.response?.title || {}),
        (page.source.my_anime_list as SourceMal)?.response?.title,
        (page.source.my_anime_list as SourceMal)?.response?.title_english,
        (page.source.my_anime_list as SourceMal)?.response?.title_japanese,
        ...((page.source.my_anime_list as SourceMal)?.response?.title_synonyms || []),
      ]),
    ].filter(t => t && t != info.title)
    if (altTitles.length > 0) {
      description.push('')
      description.push('Alternate titles:\n' + altTitles.map(t => `  - ${t}`).join('\n'))
    }

    info.description = description.join(blankLine)

    if (page.year) info.date = `${page.year}-01-01`
    if ((page.source.anilist as SourceAnilist).response?.startDate.year) {
      const sd = (page.source.anilist as SourceAnilist).response.startDate
      info.date = `${sd.year}-${sd.month || '01'}-${sd.day || '01'}`
    }
    return info
  }
}
