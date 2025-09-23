import { dateToString } from './main'
import type { SeriesData } from './parsers/MangabakaType'

export class MangaInfo {
  title: string = ''
  description: string = ''
  author: string[] = []
  artist: string[] = []
  artistObj: string[] = []
  cover: string = '/cover.jpg'
  genre: string[] = []
  url: string = ''
  status: TachiStatus = 'Unknown'
  // date?: string
  dateObj: Date
  source?: SourceInfo
  publisher: string = ''
  uuid: string = crypto.randomUUID()
  error?: string

  constructor({
    title = '',
    description = '',
    author = [] as string[],
    artist = [] as string[],
    cover = '/cover.jpg',
    genre = [] as string[],
    url = '',
    status = 'Unknown' as TachiStatus,
    date = dateToString(new Date()),
    // dateObj = new Date(),
    source = { name: 'Unknown' } as SourceInfo,
    publisher = '',
    uuid = crypto.randomUUID(),
  } = {}) {
    this.title = title
    this.description = description
    this.author = author
    this.artist = artist
    // this.artistObj = listField(artist)
    this.cover = cover
    this.genre = genre
    this.url = url
    this.status = status
    this.dateObj = new Date(date)
    this.date = date
    // Object.keys(source).forEach(key=> this.source[key]=source[key])
    // if (!this.source)
    this.source = source
    // else {
    //   this.source.name = source.name
    //   this.source.icon = source.icon
    //   this.source.url = source.url
    // }
    this.publisher = publisher
    this.uuid = uuid
  }

  get date(): string {
    return dateToString(this.dateObj)
  }
  set date(date: string) {
    this.dateObj = new Date(date)
  }
  // get artist(): string {
  //   return this.artistObj.join(', ')
  // }
  // set artist(value: string) {
  //   this.artistObj = listField(value)
  // }
  // get author():string{
  //   return listField(this.author)
  // }
}

export interface MangaModel {
  manga?: MangaInfo[]
}

export type TachiStatus =
  | 'Ongoing'
  | 'Completed'
  | 'Licensed'
  | 'Publishing finished'
  | 'Cancelled'
  | 'On hiatus'
  | 'Unknown'

// enum MangaStatus {
//   UNKNOWN,
//   ONGOING,
//   COMPLETED,
//   LICENSED,
//   PUBLISHING_FINISHED,
//   CANCELLED,
//   ON_HIATUS,
// }

export interface MetadataField {
  // isList?: boolean
  modelValue: string
  name?: string
  // options?: string[]
  // selected?: TachiStatus
  rows?: string
  type?: 'text' | 'textarea' | 'date' | 'status'
}

export interface Parser extends MultiSource {
  validateUrl: () => boolean
  parse: () => Promise<MangaInfo[]>
}

export interface Searcher extends Parser {
  search: (query: string) => Promise<SearchResult[]>
}

export interface SearchResult {
  parsed: MangaInfo
  raw: SeriesData
}

export interface ParserOptions {
  english?: boolean
  proxy?: boolean
}

export interface SourceInfo {
  name?: string
  icon?: string
  url?: string
}

interface MultiSource extends SourceInfo {
  sources?: SourceInfo[]
}
