import { blankLine, stripHtmlTags } from '@/main'
import type { Edge, Root } from '@/parsers/AnilistType'
import { MangaInfo, type Parser, type ParserOptions, type TachiStatus } from '@/types'

const statusMap = {
  FINISHED: 'Completed',
  RELEASING: 'Ongoing',
  NOT_YET_RELEASED: 'Unknown',
  CANCELLED: 'Cancelled',
  HIATUS: 'On hiatus',
}

export function AniList(url: string = '', options: ParserOptions = { english: true }): Parser {
  const source = { name: 'AniList', url: 'anilist.co', icon: 'al.png' }
  const apiUrl = 'https://graphql.anilist.co'
  const urlRE =
    new RegExp('^(?<protocol>https?://)?' + source.url + '/manga/(?<id>\\d+)').exec(url)?.groups ||
    {}

  return {
    name: source.name,
    url: `https://${source.url}`,
    icon: source.icon,
    validateUrl: () => Boolean(urlRE?.id),
    parse: async () => {
      if (!urlRE)
        if (!DEV)
          return new Promise(() => {
            return { error: 'Invalid URL' }
          })
      const getStaffNames = (edge: Edge[], role: string) => {
        return edge
          .filter(
            staff => staff.role?.toLowerCase().includes(role.toLowerCase()) && staff.node.name.full,
          )
          .map(staff => staff.node.name.full as string)
      }
      const query =
        `query {manga: Media(id: ${urlRE.id}) {title {romaji native english}` +
        ' synonyms status coverImage {extraLarge large} description genres' +
        ' tags {name} startDate {day month year} meanScore countryOfOrigin' +
        ' externalLinks {site url} volumes chapters endDate {year month day}' +
        ' staff {edges {role node {name {full}}}}}}'

      const page = await fetch(DEV ? (urlRE.id ? apiUrl : 'src/dev/anilist.json') : apiUrl, {
        method: 'post',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Accept-Encoding': 'gzip, deflate, br, zstd',
        },
        body: JSON.stringify({
          query: query,
        }),
      })
        .then(response => response.json() as Promise<Root>)
        .then(parsed => parsed.data.manga || parsed)
        .catch(e => {
          console.error(e)
          return { error: String(e) }
        })
      if ('error' in page) return [{ error: page.error } as MangaInfo]

      const data = new MangaInfo({
        source: source,
        title:
          (options.english ? page.title.english : null) ||
          page.title.romaji ||
          page.title.native ||
          '',
        genre: [
          ...page.genres,
          ...page.tags.filter(tag => tag.name).map(tag => tag.name as string),
        ],
        artist: getStaffNames(page.staff.edges, 'art'),
        author: getStaffNames(page.staff.edges, 'story'),
        cover: page.coverImage.extraLarge || page.coverImage.large,
        status: statusMap[page.status || 'NOT_YET_RELEASED'] as TachiStatus,
        publisher: getStaffNames(page.staff.edges, 'translat').join(', '),
        // page.externalLinks
        //   ?.filter((link) => link.site)
        //   .map((link) => link.site)
        //   .join(', '),
        //page.externalLinks?.filter(link=>link.site&&link.url).map(link => `[${link.site}](${link.url})`)
        description: page.description || '',
        url: [
          `https://${source.url}${urlRE.id}`,
          ...(page.externalLinks?.map(e => e.url) || []),
        ].join(' '),
      })
      if (page.description) {
        data.description = stripHtmlTags(page.description)
      }
      if (page.synonyms.length > 0) {
        data.description +=
          `${blankLine}${blankLine}Alternate titles:${blankLine}- ` +
          [...Object.values(page.title).filter(t => t != data.title), ...page.synonyms].join('\n- ')
      }
      if (page.startDate.year)
        data.date = `${page.startDate.year}-${page.startDate.month || '01'}-${page.startDate.day || '01'}`
      return [data]
    },
  }
}
