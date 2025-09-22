export interface Root {
  data: Data
}

export interface Data {
  manga: Manga
}

export interface Manga {
  title: Title
  synonyms: string[] | []
  status: 'FINISHED' | 'RELEASING' | 'NOT_YET_RELEASED' | 'CANCELLED' | 'HIATUS'
  coverImage: CoverImage
  description?: string
  genres: string[] | []
  tags: Tag[] | []
  startDate: FuzzyDate
  meanScore?: number
  countryOfOrigin?: string
  externalLinks: ExternalLink[] | []
  volumes?: number
  chapters?: number
  endDate: FuzzyDate
  staff: Staff
}

export interface Title {
  romaji?: string
  native?: string
  english?: string
}

export interface CoverImage {
  extraLarge?: string
  large?: string
}

export interface Tag {
  name: string
}

export interface FuzzyDate {
  day?: number
  month?: number
  year?: number
}

export interface ExternalLink {
  site: string
  url: string
}

export interface Staff {
  edges: Edge[] | []
}

export interface Edge {
  role: string
  node: Node
}

export interface Node {
  name: Name
}

export interface Name {
  full?: string
}
