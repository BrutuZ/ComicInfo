import { dateToString, DEV, stringToList, stripCounter, stripHtmlTags } from '@/main'
import { MangaInfo, type Parser, type ParserOptions } from '@/types'

export function HNexus(url: string = '', options: ParserOptions = { proxy: true }): Parser {
  const source = { name: 'HentaiNexus', url: 'hentainexus.com', icon: 'hn.png' }
  const urlRE = new RegExp('^(?<protocol>https?://)?' + source.url + '/view/(?<id>\\d+)').exec(
    url,
  )?.groups

  return {
    name: source.name,
    url: `https://${source.url}`,
    icon: source.icon,
    validateUrl: () => Boolean(urlRE?.id),
    parse: async () => {
      url = `https://${source.url}/view/${urlRE?.id}`
      const page = await fetch(
        DEV
          ? urlRE?.id
            ? // 'http://localhost:5000/api/request?'
              options.proxy
              ? 'https://corsproxy.io/?' + String(new URLSearchParams({ url: url }))
              : url
            : 'src/dev/hn.htm'
          : 'src/dev/hn.htm',
        {
          referrer: 'https://hentainexus.com',
          headers: {
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            Host: 'hentainexus.com',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            Origin: '*',
          },
        },
      )
        .then(response => {
          console.log('Proxy:', response.url)
          return response.text()
        })
        .then(text => {
          return new DOMParser().parseFromString(text, 'text/html')
        })
        .catch(e => {
          console.error(e)
          return { error: String(e) } as MangaInfo
        })
      if (page instanceof MangaInfo) return [{ error: page.error } as MangaInfo]

      const data = new MangaInfo({ source: source, status: 'Completed' })
      data.title = (page.querySelector('.title')?.textContent || '').trim()
      data.genre = [
        ...(Array.from(page.querySelectorAll('.tag'))?.map(tag => stripCounter(tag.textContent)) ||
          []),
        'hentai',
      ]
      const cover = page.querySelector('figure.image>img') as HTMLImageElement | null
      if (cover) data.cover = cover.src
      page.querySelectorAll('td.viewcolumn').forEach(el => {
        const field = (el.textContent || '').trim()
        const value = el.parentElement?.querySelector('td+td')
        switch (field) {
          case 'Published':
            data.date = dateToString(
              value ? new Date((value?.textContent || '').trim()) : new Date(),
            )
            break
          case 'Description':
            data.description = stripHtmlTags(value?.innerHTML).trim()
            break
          case 'Artist':
            data.artist = stringToList(value?.textContent)
            break
          case 'Circle':
            data.author = stringToList(value?.textContent)
          case 'Pages':
          case 'Parody':
          case 'Publisher':
          case 'Magazine':
            break
        }
      })
      return [data]
    },
  }
}
