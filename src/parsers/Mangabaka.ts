import { blankLine, capitalizeTags, DEV, replaceSmartQuotes, stripHtmlTags, unique } from '@/main'
import type {
  MangaResponse,
  SearchResponse,
  SeriesData,
  SourceNames,
  SourcesType,
  TitlesV2,
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

  function entryLanguage(mediaType: SeriesData['type']): string {
    return mediaType == 'manhwa' ? 'ko' : mediaType == 'manhua' ? 'zh' : 'ja'
  }

  function getTitle(titles: TitlesV2[], mediaType: SeriesData['type']): string {
    const filters: { primaries: TitlesV2[]; lang?: TitlesV2[]; officials?: TitlesV2[] } = {
      primaries: [],
    }
    filters['primaries'] = titles
      .sort((a, b) => a.language.localeCompare(b.language))
      .filter(t => t.is_primary)
    if (filters['primaries'].length)
      filters['lang'] = filters['primaries'].filter(
        t =>
          t.language ==
          (options.english && filters['primaries'].find(p => p.language == 'en')
            ? 'en'
            : entryLanguage(mediaType) + '-Latn'),
      )
    if (filters['lang']?.length)
      filters['officials'] = filters['lang'].filter(t => t.traits.includes('official'))
    return (filters.officials?.shift() || filters.lang?.shift() || filters.primaries[0]).title
  }

  function buildInfo(page: SeriesData) {
    const info = new MangaInfo({
      source: source,
      title: getTitle(page.titles, page.type),
      genre: [],
      artist: page.artists,
      author: page.authors,
      cover: page.cover.raw?.url || page.cover.x350?.x1,
      status: statusMap[page.status] as TachiStatus,
      publisher: page.publishers?.map(p => p.name).join(', '),
      description: page.description,
      url: [
        ...new Set([
          `${source.url}/${page.id}`,
          ...Object.entries(page.source as SourcesType).map(s => {
            if (s[0] in sourceUrlMap && s[1]?.id)
              return `${sourceUrlMap[s[0] as SourceNames]}${s[1].id}`
          }),
          ...(page.links || []),
        ]),
      ]
        .filter(u => u)
        .join(' '),
    })

    const tags: { [k: string]: string[] } = {
      Genre: [
        ...(page.tags_v2 || [])
          .filter(
            (t, _, a) =>
              t.is_genre &&
              !a.map(x => x.parent_id).includes(t.id) &&
              t.implied_by_tag_ids.length == 0 &&
              (options.spoilers ? true : !t.is_spoiler),
          )
          .map(x => x.name),
        ...(page.genres || [])
          .filter(g => !page.tags_v2.map(t => t.name.toLowerCase()).includes(g.toLowerCase()))
          .map(t => capitalizeTags(t)),
      ],
      Themes: (page.tags_v2 || [])
        .filter(
          (t, _, a) =>
            t.name_path.startsWith('Themes') &&
            !a.map(x => x.parent_id).includes(t.id) &&
            t.implied_by_tag_ids.length == 0 &&
            (options.spoilers ? true : !t.is_spoiler),
        )
        .map(t => t.name),
    }

    page.tags_v2
      .filter(
        (t, _, a) =>
          !Object.values(tags).flat().includes(t.name) &&
          !a.map(x => x.parent_id).includes(t.id) &&
          t.implied_by_tag_ids.length == 0 &&
          (options.spoilers ? true : !t.is_spoiler),
      )
      .forEach(t => {
        const path = t.name_path.split(' > ')
        if (path.length > 0) {
          const namespace = path.shift() || ''
          const val = path.pop() || ''
          if (tags[namespace] === undefined) {
            tags[namespace] = []
          }
          tags[namespace].push(val)
        }
      })

    tags['Other'] = (page.tags || []).filter(
      t => !page.tags_v2.map(tt => tt.name.toLowerCase()).includes(t.toLowerCase()),
    )
    tags['Licensed'] = page.publishers?.map(p => p.name) || []

    info.genre = options.groupTags
      ? Object.keys(tags).flatMap(namespace => tags[namespace].map(t => `${namespace}:${t}`).sort())
      : Object.values(tags).flat().sort()

    const description = []
    const descriptionHeader = []
    if (page.rating) {
      const stars = Math.min(Number((page.rating / (page.rating < 10 ? 2 : 20)).toFixed()), 5)
      descriptionHeader.push(
        [
          '★'.repeat(stars),
          '☆'.repeat(5 - stars),
          ' ',
          (page.rating < 10 ? page.rating : page.rating / 10).toFixed(1),
        ].join(''),
      )
    }
    // if (page.is_licensed && options.showLicensed) descriptionHeader.push('💱 Licensed')
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
      descriptionHeader.push('📺 ' + animeEps.join(', '))
    }
    if (descriptionHeader.length > 0) {
      description.push(descriptionHeader.join(' | ') + '\n')
    }

    if (page.description) description.push(stripHtmlTags(page.description))

    const lang_prio: string[] = [
      ...(options.english ? ['en'] : []),
      ...[entryLanguage(page.type) + '-Latn', entryLanguage(page.type)],
    ]

    const altTitles = page.titles.sort((a, b) =>
      a.language.slice(0, 2).localeCompare(b.language.slice(0, 2)),
    )
    for (const l of lang_prio.reverse()) {
      altTitles.unshift(...page.titles.filter(t => t.language == l))
    }
    if (altTitles.length > 0) {
      description.push('')
      description.push(
        'Alternate titles:\n' +
          unique(altTitles.map(t => t.title).filter(t => t && t != info.title))
            .map(t => `  - ${t}`)
            .join('\n'),
      )
    }

    info.description = description.join(blankLine)

    info.date = page.published.start_date || ''
    return info
  }
}
