import type { FuzzyDate } from '@/parsers/AnilistType'

export interface SearchResponse {
  status: number
  message?: string
  pagination: {
    count: number
    next?: string
    previous?: string
    page: number
    limit: number
  }
  data?: SeriesData[]
}

export interface MangaResponse {
  status: number
  data?: SeriesData
  message?: string
}

export interface SeriesData {
  /**
   * MangaBaka series ID.
   */
  id: number
  /**
   * When state is `merged` see the `merged_with` field for the new series ID. You should update your system reference to the new ID to receive future series updates.
   */
  state: 'active' | 'merged' | 'deleted'
  /**
   * When series `state` is `merged`, this field represent the new series. Please update your records to this value
   */
  merged_with: number
  /**
   * The series primary title, first non-empty value of
   *
   * - Official English licensed title
   * - Romanized title
   * - Native title
   * - Alternative title
   */
  title: string
  /**
   * The title for the series in its native (original) language
   */
  native_title: string
  /**
   * The romanized representation of the native title
   */
  romanized_title: string
  secondary_titles: {
    de?: SecondaryTitle[]
    en?: SecondaryTitle[]
    es?: SecondaryTitle[]
    fr?: SecondaryTitle[]
    it?: SecondaryTitle[]
    ja?: SecondaryTitle[]
    'ja-ro'?: SecondaryTitle[]
    ko?: SecondaryTitle[]
    'ko-ro'?: SecondaryTitle[]
    pt?: SecondaryTitle[]
    ru?: SecondaryTitle[]
    'ru-ro'?: SecondaryTitle[]
    zh?: SecondaryTitle[]
    'zh-ro'?: SecondaryTitle[]
    // [k: string]: unknown
  }
  /**
   * The primary cover image for the series. You may hotlink to the non-raw image in your application.
   */
  cover: {
    raw?: {
      url: string
      size?: number
      height?: number
      width?: number
      blurhash?: string
      thumbhash?: string
      format?: string
    }
    x150?: CoverSet
    x250?: CoverSet
    x350?: CoverSet
    [k: string]: unknown
  }
  /**
   * Staff that is credited with being authors on the sites
   */
  authors: string[]
  /**
   * Staff that is credited with being artists on the sites
   */
  artists: string[]
  /**
   * The series description
   */
  description: string
  /**
   * The year publication began for the series
   */
  year: number
  /**
   * The series publication status.
   */
  status: 'cancelled' | 'completed' | 'hiatus' | 'releasing' | 'unknown' | 'upcoming'
  /**
   * Has the series been licensed in English?
   */
  is_licensed: boolean
  /**
   * Has the series gotten an anime adaptation?
   */
  has_anime: boolean
  /**
   * Details about the anime adaptation
   */
  anime: {
    /**
     * From what volume/chapter did the anime start at
     */
    start: string
    /**
     * At what volume/chapter did the anime stop at
     */
    end: string
    [k: string]: unknown
  }
  /**
   * The sexual content rating of the series - denotes the highest level of sexual content shown.
   *
   * Generally, "safe" has no nudity or sex, "suggestive" can have nudity but no sex, "erotica" has sex but it's censored, and "pornographic" has uncensored sex or for censored 18+ works.
   */
  content_rating: 'safe' | 'suggestive' | 'erotica' | 'pornographic'
  /**
   * The media type for the series.
   */
  type: 'manga' | 'novel' | 'manhwa' | 'manhua' | 'oel' | 'other'
  /**
   * The MangaBaka meta rating, the average of all the source ratings. See `source[*].rating` for individual source ratings
   */
  rating: number
  final_volume: string
  final_chapter: string
  total_chapters: string
  /**
   * A raw list of links related to the series. There will always be a link to MangaBaka in this list.
   */
  links?: string[]
  /**
   * List of publishers for the series
   */
  publishers: {
    name: string
    type: string
    note: string
    [k: string]: unknown
  }[]
  /**
   * Series genres
   */
  genres?: (
    | 'action'
    | 'adult'
    | 'adventure'
    | 'avant_garde'
    | 'award_winning'
    | 'boys_love'
    | 'comedy'
    | 'doujinshi'
    | 'drama'
    | 'ecchi'
    | 'erotica'
    | 'fantasy'
    | 'gender_bender'
    | 'girls_love'
    | 'gourmet'
    | 'harem'
    | 'hentai'
    | 'historical'
    | 'horror'
    | 'josei'
    | 'lolicon'
    | 'mahou_shoujo'
    | 'martial_arts'
    | 'mature'
    | 'mecha'
    | 'music'
    | 'mystery'
    | 'psychological'
    | 'romance'
    | 'school_life'
    | 'sci-fi'
    | 'seinen'
    | 'shotacon'
    | 'shoujo'
    | 'shoujo_ai'
    | 'shounen'
    | 'shounen_ai'
    | 'slice_of_life'
    | 'smut'
    | 'sports'
    | 'supernatural'
    | 'suspense'
    | 'thriller'
    | 'tragedy'
    | 'yaoi'
    | 'yuri'
  )[]
  /**
   * Freeform list of tags for a series. These values are *NOT* stable and may change at any time.
   */
  tags: string[]
  /**
   * Most recent timestamp for when ANY source was updated. See `source[*].last_updated_at` (in the full response) for individual source update timestamps
   */
  last_updated_at: string
  /**
   * List of relationships for the series. Each key contains a list of MangaBaka series ID.
   */
  relationships: {
    main_story?: number[]
    adaptation?: number[]
    prequel?: number[]
    sequel?: number[]
    side_story?: number[]
    spin_off?: number[]
    alternative?: number[]
    other?: number[]
    [k: string]: unknown
  }
  /**
   * Source specific data
   */
  source: Sources
}

export type SourceNames = 'anilist' | 'anime_planet' | 'anime_news_network' | 'kitsu' | 'manga_updates' | 'my_anime_list' | 'shikimori'

export type SourcesType = { [k in SourceNames]?: SourceSimple }

interface Sources {
  anilist: SourceSimple | SourceAnilist
  anime_planet?: SourceSimple
  anime_news_network: SourceSimple | SourceANN
  kitsu: SourceSimple | SourceKitsu
  manga_updates: SourceSimple | SourceMangaUpdates
  my_anime_list: SourceSimple | SourceMal
  shikimori?: SourceSimple | SourceShikimori
}

export interface SecondaryTitle {
  type: 'alternative' | 'native' | 'official' | 'unofficial'
  title: string
  note?: string
  // [k: string]: unknown
}

export interface SourceSimple {
  id: number
  rating: number
  // [k: string]: unknown
}

export interface SourceAnilist extends SourceSimple {
  cover: string
  last_updated_at: string
  response: {
    bannerImage: string
    coverImage: {
      color?: string
      extraLarge?: string
      large?: string
      medium?: string
      [k: string]: unknown
    }
    format:
    | 'MANGA'
    | 'MOVIE'
    | 'MUSIC'
    | 'NOVEL'
    | 'ONA'
    | 'ONE_SHOT'
    | 'OVA'
    | 'SPECIAL'
    | 'TV'
    | 'TV_SHORT'
    id: number
    status: 'CANCELLED' | 'FINISHED' | 'HIATUS' | 'NOT_YET_RELEASED' | 'RELEASING'
    title: {
      english?: string
      native?: string
      romaji?: string
      userPreferred: string
      [k: string]: unknown
    }
    type: 'ANIME' | 'MANGA'
    averageScore: number
    chapters: number
    countryOfOrigin: string
    description: string
    endDate: FuzzyDate
    externalLinks: {
      color: string
      icon: string
      id: number
      isDisabled: boolean
      language: string
      notes: string
      site: string
      type: 'INFO' | 'SOCIAL' | 'STREAMING'
      url: string
      [k: string]: unknown
    }[]
    favourites: number
    genres: string[]
    hashtag: string
    isAdult: boolean
    isFavourite: boolean
    isFavouriteBlocked: boolean
    isLicensed: boolean
    isLocked: boolean
    isRecommendationBlocked: boolean
    isReviewBlocked: boolean
    meanScore: number
    popularity: number
    season: 'FALL' | 'SPRING' | 'SUMMER' | 'WINTER'
    seasonYear: number
    source:
    | 'ANIME'
    | 'COMIC'
    | 'DOUJINSHI'
    | 'GAME'
    | 'LIGHT_NOVEL'
    | 'LIVE_ACTION'
    | 'MANGA'
    | 'MULTIMEDIA_PROJECT'
    | 'NOVEL'
    | 'ORIGINAL'
    | 'OTHER'
    | 'PICTURE_BOOK'
    | 'VIDEO_GAME'
    | 'VISUAL_NOVEL'
    | 'WEB_NOVEL'
    synonyms: string[]
    tags: {
      category?: string
      description: string
      id: number
      isGeneralSpoiler: boolean
      isMediaSpoiler: boolean
      name: string
      rank: number
      [k: string]: unknown
    }[]
    updatedAt: number
    volumes: number
    staff?: {
      edges: {
        id: number
        node: {
          gender: string
          image: {
            large: string
            medium: string
            [k: string]: unknown
          }
          name: {
            alternative: string[]
            first: string
            full: string
            last: string
            native: string
            userPreferred: string
            [k: string]: unknown
          }
          siteUrl: string
          [k: string]: unknown
        }
        role: string
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    rankings: {
      allTime: boolean
      context: string
      format:
      | 'MANGA'
      | 'MOVIE'
      | 'MUSIC'
      | 'NOVEL'
      | 'ONA'
      | 'ONE_SHOT'
      | 'OVA'
      | 'SPECIAL'
      | 'TV'
      | 'TV_SHORT'
      id: number
      rank: number
      type: 'POPULAR' | 'RATED'
      year: number
      [k: string]: unknown
    }[]
    relations: {
      edges: {
        id: number
        node: {
          bannerImage: string
          coverImage: {
            color?: string
            extraLarge?: string
            large?: string
            medium?: string
            [k: string]: unknown
          }
          format:
          | 'MANGA'
          | 'MOVIE'
          | 'MUSIC'
          | 'NOVEL'
          | 'ONA'
          | 'ONE_SHOT'
          | 'OVA'
          | 'SPECIAL'
          | 'TV'
          | 'TV_SHORT'
          id: number
          status: 'CANCELLED' | 'FINISHED' | 'HIATUS' | 'NOT_YET_RELEASED' | 'RELEASING'
          title: {
            english?: string
            native?: string
            romaji?: string
            userPreferred: string
            [k: string]: unknown
          }
          type: 'ANIME' | 'MANGA'
          [k: string]: unknown
        }
        relationType:
        | 'ADAPTATION'
        | 'ALTERNATIVE'
        | 'CHARACTER'
        | 'COMPILATION'
        | 'CONTAINS'
        | 'OTHER'
        | 'PARENT'
        | 'PREQUEL'
        | 'SEQUEL'
        | 'SIDE_STORY'
        | 'SOURCE'
        | 'SPIN_OFF'
        | 'SUMMARY'
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    startDate: FuzzyDate
    stats: {
      scoreDistribution: {
        amount: number
        score: number
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    studios: {
      edges: {
        isMain: boolean
        node: {
          id: number
          name: string
          [k: string]: unknown
        }
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    duration?: number
    episodes?: number
    mediaListEntry?: {
      [k: string]: unknown
    }
  }
  [k: string]: unknown
}

export interface SourceANN extends SourceSimple {
  cover: string
  last_updated_at: string
  response: {
    id: number
    title: string
    type: 'manga' | 'novel'
    cover?: string
    releases?: {
      id: number
      link: string
      title: string
      type: string
      volume: string
      date: string
      price: string
      [k: string]: unknown
    }[]
    plot_summary?: string
    objectionable_content?: string
    number_of_tankoubon?: string
    number_of_pages?: string
    alternative_title?: {
      value: string
      language: string
      [k: string]: unknown
    }[]
    chronology?: string[]
    volumes?: string[]
    comment?: string[]
    vintage?: string[]
    official_website?: {
      url: string
      title: string
      [k: string]: unknown
    }[]
    genres?: string[]
    themes?: string[]
    convention_reports: {
      href: string
      text: string
      primary: boolean
      published_at: string
      [k: string]: unknown
    }[]
    interest: {
      href: string
      text: string
      primary: boolean
      published_at: string
      [k: string]: unknown
    }[]
    interviews: {
      href: string
      text: string
      primary: boolean
      published_at: string
      [k: string]: unknown
    }[]
    news: {
      href: string
      text: string
      primary: boolean
      published_at: string
      [k: string]: unknown
    }[]
    other_articles: {
      href: string
      text: string
      primary: boolean
      published_at: string
      [k: string]: unknown
    }[]
    press_releases: {
      href: string
      text: string
      primary: boolean
      published_at: string
      [k: string]: unknown
    }[]
    reviews: {
      href: string
      text: string
      primary: boolean
      published_at: string
      [k: string]: unknown
    }[]
    user_ratings?: {
      average: number
      total_votes: number
      distribution: {
        votes: number
        rating: number
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    [k: string]: unknown
  }
  [k: string]: unknown
}

export interface SourceMangaUpdates extends SourceSimple {
  cover: string
  last_updated_at: string
  response: {
    series_id: number
    title: string
    url: string
    associated: {
      title: string
      [k: string]: unknown
    }[]
    description: string
    image: {
      url: {
        original: string
        thumb: string
        [k: string]: unknown
      }
      height: number
      width: number
      [k: string]: unknown
    }
    type:
    | 'Artbook'
    | 'Doujinshi'
    | 'Drama CD'
    | 'Filipino'
    | 'Indonesian'
    | 'Manga'
    | 'Manhwa'
    | 'Manhua'
    | 'Novel'
    | 'OEL'
    | 'Thai'
    | 'Vietnamese'
    | 'Malaysian'
    | 'Nordic'
    | 'French'
    | 'Spanish'
    | 'German'
    year: string
    bayesian_rating: number
    rating_votes: number
    genres: {
      genre: string
      [k: string]: unknown
    }[]
    categories: {
      series_id?: number
      category: string
      votes: number
      votes_plus?: number
      votes_minus?: number
      added_by?: number
      [k: string]: unknown
    }[]
    latest_chapter: number
    forum_id: number
    status: string
    licensed: boolean
    completed: boolean
    anime: {
      start: string
      end: string
      [k: string]: unknown
    }
    related_series: {
      relation_id?: number
      relation_type:
      | 'Prequel'
      | 'Sequel'
      | 'Spin-Off'
      | 'Adapted From'
      | 'Alternate Version'
      | 'Part of Anthology'
      | 'Main Story'
      | 'Side Story'
      | 'Full Anthology'
      | 'Other'
      related_series_id: number
      related_series_name: string
      related_series_url: string
      triggered_by_relation_id: number
      [k: string]: unknown
    }[]
    authors: {
      name: string
      author_id: number
      url: string
      type: 'Author' | 'Artist'
      [k: string]: unknown
    }[]
    publishers?: {
      publisher_name: string
      publisher_id: number
      url: string
      type: 'Original' | 'English'
      notes?: string
      [k: string]: unknown
    }[]
    publications: {
      publication_name: string
      publisher_name: string
      publisher_id: number
      [k: string]: unknown
    }[]
    recommendations: {
      series_name: string
      series_url: string
      series_id: number
      series_image: {
        url: {
          original: string
          thumb: string
          [k: string]: unknown
        }
        height: number
        width: number
        [k: string]: unknown
      }
      weight: number
      [k: string]: unknown
    }[]
    category_recommendations: {
      series_name: string
      series_url: string
      series_id: number
      series_image: {
        url: {
          original: string
          thumb: string
          [k: string]: unknown
        }
        height: number
        width: number
        [k: string]: unknown
      }
      weight: number
      [k: string]: unknown
    }[]
    rank: {
      position: {
        week: number
        month: number
        three_months: number
        six_months: number
        year: number
        [k: string]: unknown
      }
      old_position: {
        week: number
        month: number
        three_months: number
        six_months: number
        year: number
        [k: string]: unknown
      }
      lists: {
        reading: number
        wish: number
        complete: number
        unfinished: number
        custom: number
        [k: string]: unknown
      }
      [k: string]: unknown
    }
    last_updated: {
      timestamp: number
      as_rfc3339: string
      as_string: string
      [k: string]: unknown
    }
  }
  [k: string]: unknown
}

export interface SourceMal extends SourceSimple {
  cover: string
  last_updated_at: string
  response: {
    mal_id: number
    url: string
    images: {
      jpg: {
        image_url: string
        small_image_url: string
        large_image_url: string
        [k: string]: unknown
      }
      webp: {
        image_url: string
        small_image_url: string
        large_image_url: string
        [k: string]: unknown
      }
      [k: string]: unknown
    }
    approved: boolean
    titles: {
      type: string
      title: string
      [k: string]: unknown
    }[]
    title: string
    title_english: string
    title_japanese: string
    title_synonyms: string[]
    type: 'Manga' | 'Novel' | 'Light Novel' | 'One-shot' | 'Doujinshi' | 'Manhua' | 'Manhwa' | 'OEL'
    chapters: number
    volumes: number
    status: 'Finished' | 'Publishing' | 'On Hiatus' | 'Discontinued' | 'Not yet published'
    publishing: boolean
    published: {
      from: string
      to: string
      prop: {
        from: {
          day: number
          month: number
          year: number
          [k: string]: unknown
        }
        to: {
          day: number
          month: number
          year: number
          [k: string]: unknown
        }
        string?: string
        [k: string]: unknown
      }
      [k: string]: unknown
    }
    score: number
    scored_by: number
    rank: number
    popularity: number
    members: number
    favorites: number
    synopsis: string
    background: string
    authors: {
      mal_id: number
      type: string
      name: string
      url: string
      [k: string]: unknown
    }[]
    serializations: {
      mal_id: number
      type: string
      name: string
      url: string
      [k: string]: unknown
    }[]
    genres: {
      mal_id: number
      type: string
      name: string
      url: string
      [k: string]: unknown
    }[]
    explicit_genres: {
      mal_id: number
      type: string
      name: string
      url: string
      [k: string]: unknown
    }[]
    themes: {
      mal_id: number
      type: string
      name: string
      url: string
      [k: string]: unknown
    }[]
    demographics: {
      mal_id: number
      type: string
      name: string
      url: string
      [k: string]: unknown
    }[]
    relations: {
      relation: string
      entry: {
        mal_id: number
        type: string
        name: string
        url: string
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }[]
    external: {
      name: string
      url: string
      [k: string]: unknown
    }[]
    [k: string]: unknown
  }
  [k: string]: unknown
}

export interface SourceKitsu extends SourceSimple {
  cover: string
  last_updated_at: string
  response: {
    ageRating?: 'G' | 'PG' | 'R' | 'R18'
    ageRatingGuide?: string
    averageRating?: number
    averageRatingRank?: number
    bannerImage?: {
      blurhash?: string
      original: {
        height?: number
        name: string
        url: string
        width?: number
        [k: string]: unknown
      }
      views: {
        height?: number
        name: string
        url: string
        width?: number
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    categories: {
      nodes?: {
        id: number
        isNsfw: boolean
        slug: string
        title: {
          [k: string]: string
        }
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    chapterCount?: number
    chapterCountGuess?: number
    createdAt: string
    description: {
      en?: string
      [k: string]: unknown
    }
    endDate?: string
    favoritesCount?: number
    id: number
    mappings: {
      nodes?: {
        externalId: string
        externalSite:
        | 'ANIDB'
        | 'ANILIST_ANIME'
        | 'ANILIST_MANGA'
        | 'ANIMENEWSNETWORK'
        | 'AOZORA'
        | 'HULU'
        | 'IMDB_EPISODES'
        | 'MANGAUPDATES'
        | 'MYANIMELIST_ANIME'
        | 'MYANIMELIST_CHARACTERS'
        | 'MYANIMELIST_MANGA'
        | 'MYANIMELIST_PEOPLE'
        | 'MYANIMELIST_PRODUCERS'
        | 'MYDRAMALIST'
        | 'THETVDB'
        | 'THETVDB_SEASON'
        | 'THETVDB_SERIES'
        | 'TRAKT'
        id: number
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    originCountries: string[]
    originLanguages: string[]
    posterImage?: {
      blurhash?: string
      original: {
        height?: number
        name: string
        url: string
        width?: number
        [k: string]: unknown
      }
      views: {
        height?: number
        name: string
        url: string
        width?: number
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    relationships: {
      nodes: {
        destination: {
          id: number
          slug: string
          type: string
          [k: string]: unknown
        }
        kind:
        | 'ADAPTATION'
        | 'ALTERNATIVE_SETTING'
        | 'ALTERNATIVE_VERSION'
        | 'CHARACTER'
        | 'FULL_STORY'
        | 'OTHER'
        | 'PARENT_STORY'
        | 'PREQUEL'
        | 'SEQUEL'
        | 'SIDE_STORY'
        | 'SPINOFF'
        | 'SUMMARY'
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    sfw: boolean
    slug: string
    staff: {
      nodes?: {
        id: number
        person: {
          id: number
          name: string
          slug: string
          [k: string]: unknown
        }
        role: string
        [k: string]: unknown
      }[]
      [k: string]: unknown
    }
    startDate?: string
    status: 'CURRENT' | 'FINISHED' | 'TBA' | 'UNRELEASED' | 'UPCOMING'
    subtype: 'DOUJIN' | 'MANGA' | 'MANHUA' | 'MANHWA' | 'NOVEL' | 'OEL' | 'ONESHOT'
    tba?: string
    titles: {
      alternatives?: string[]
      canonical: string
      canonicalLocale?: string
      original?: string
      originalLocale?: string
      preferred: string
      romanized?: string
      romanizedLocale?: string
      translated?: string
      translatedLocale?: string
      [k: string]: unknown
    }
    type: string
    updatedAt: string
    userCount?: number
    userCountRank?: number
    volumeCount?: number
  }
  [k: string]: unknown
}

export interface SourceShikimori extends SourceSimple {
  cover: string
  last_updated_at: string
  response: {
    id: number
    malId?: number
    name: string
    russian?: string
    licenseNameRu?: string
    english?: string
    japanese?: string
    synonyms: string[]
    kind: string
    score: number
    status: 'anons' | 'ongoing' | 'released' | 'paused' | 'discontinued'
    volumes: number
    chapters: number
    airedOn: {
      year?: number
      month?: number
      day?: number
      date?: string
      [k: string]: unknown
    }
    releasedOn: {
      year?: number
      month?: number
      day?: number
      date?: string
      [k: string]: unknown
    }
    url: string
    poster: {
      id: number
      originalUrl: string
      mainUrl: string
      [k: string]: unknown
    }
    licensors: string[]
    createdAt: string
    updatedAt: string
    isCensored: boolean
    genres: {
      id: number
      name: string
      russian: string
      kind: string
      [k: string]: unknown
    }[]
    publishers: {
      id: string
      name: string
      [k: string]: unknown
    }[]
    externalLinks: {
      id: number
      kind: string
      url: string
      createdAt?: string
      updatedAt?: string
      [k: string]: unknown
    }[]
    personRoles: {
      id: number
      rolesRu: string[]
      rolesEn: string[]
      person: {
        id: number
        name: string
        poster: {
          id: number
          originalUrl: string
          mainUrl: string
          [k: string]: unknown
        }
        [k: string]: unknown
      }
      [k: string]: unknown
    }[]
    characterRoles: {
      id: number
      rolesRu: string[]
      rolesEn: string[]
      character: {
        id: number
        name: string
        poster: {
          id: number
          originalUrl: string
          mainUrl: string
          [k: string]: unknown
        }
        [k: string]: unknown
      }
      [k: string]: unknown
    }[]
    related: {
      id: number
      anime: {
        id: number
        name: string
        [k: string]: unknown
      }
      manga: {
        id: number
        name: string
        [k: string]: unknown
      }
      relationKind: string
      relationText: string
      [k: string]: unknown
    }[]
    scoresStats: {
      score: number
      count: number
      [k: string]: unknown
    }[]
    statusesStats: {
      status: string
      count: number
      [k: string]: unknown
    }[]
    description: string
    descriptionHtml: string
    descriptionSource: string
    [k: string]: unknown
  }
  [k: string]: unknown
}

interface CoverSet {
  x1?: string
  x2?: string
  x3?: string
}
