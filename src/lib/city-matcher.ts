export interface CityMatchCandidate {
  id: number
  name: string
  slug: string
}

export interface CityMatch {
  city: CityMatchCandidate
  score: number
}

export interface RouteCityPair {
  origin: CityMatch
  destination: CityMatch
}

const routeConnectors = new Set(['to', 'from', 'thi', 'se', 'sudhi', 'via', 'towards'])

export function normalizeSearchText(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function cityAliases(name: string) {
  const normalized = normalizeSearchText(name)
  if (normalized === 'vadodara') return [normalized, 'baroda']
  if (normalized === 'baroda') return [normalized, 'vadodara']
  return [normalized]
}

function editDistance(left: string, right: string) {
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index)

  for (let i = 1; i <= left.length; i++) {
    let diagonal = previous[0]
    previous[0] = i
    for (let j = 1; j <= right.length; j++) {
      const above = previous[j]
      previous[j] = Math.min(
        previous[j] + 1,
        previous[j - 1] + 1,
        diagonal + (left[i - 1] === right[j - 1] ? 0 : 1),
      )
      diagonal = above
    }
  }

  return previous[right.length]
}

function wordScore(queryWord: string, cityWord: string) {
  if (queryWord === cityWord) return 100
  if (queryWord.length >= 2 && cityWord.startsWith(queryWord)) return 88
  if (cityWord.length >= 3 && queryWord.startsWith(cityWord)) return 76
  if (queryWord.length < 4) return 0

  const distance = editDistance(queryWord, cityWord)
  const maxDistance = queryWord.length < 6 ? 1 : 2
  return distance <= maxDistance ? 72 - distance * 12 : 0
}

export function scoreCityMatch(query: string, city: CityMatchCandidate) {
  const normalized = normalizeSearchText(query)
  if (normalized.length < 2) return 0

  const aliases = cityAliases(city.name)
  if (aliases.includes(normalized)) return 100
  if (aliases.some((alias) => alias.startsWith(normalized))) return 92
  if (aliases.some((alias) => alias.includes(normalized))) return 82

  const queryWords = normalized.split(' ').filter((word) => !routeConnectors.has(word))
  const cityWords = normalizeSearchText(city.name).split(' ')
  if (!queryWords.length) return 0

  const scores = queryWords.map((queryWord) =>
    Math.max(0, ...cityWords.map((cityWord) => wordScore(queryWord, cityWord))),
  )

  if (scores.some((score) => score === 0)) return 0
  return scores.reduce((sum, score) => sum + score, 0) / scores.length
}

export function findCityMatches(
  query: string,
  cities: CityMatchCandidate[],
  limit = 5,
): CityMatch[] {
  return cities
    .map((city) => ({ city, score: scoreCityMatch(query, city) }))
    .filter((match) => match.score >= 48)
    .sort((a, b) => b.score - a.score || a.city.name.localeCompare(b.city.name))
    .slice(0, limit)
}

export function findRouteCityPair(
  query: string,
  cities: CityMatchCandidate[],
): RouteCityPair | null {
  const words = normalizeSearchText(query).split(' ').filter(Boolean)
  if (words.length < 2) return null

  const splits: Array<[string[], string[]]> = []
  for (let index = 1; index < words.length; index++) {
    if (routeConnectors.has(words[index])) {
      splits.push([
        words.slice(0, index).filter((word) => !routeConnectors.has(word)),
        words.slice(index + 1).filter((word) => !routeConnectors.has(word)),
      ])
    } else if (!words.slice(0, index).some((word) => routeConnectors.has(word))) {
      splits.push([
        words.slice(0, index).filter((word) => !routeConnectors.has(word)),
        words.slice(index).filter((word) => !routeConnectors.has(word)),
      ])
    }
  }

  let best: RouteCityPair | null = null
  let bestScore = 0

  for (const [originWords, destinationWords] of splits) {
    if (!originWords.length || !destinationWords.length) continue
    const origin = findCityMatches(originWords.join(' '), cities, 1)[0]
    const destination = findCityMatches(destinationWords.join(' '), cities, 1)[0]
    if (!origin || !destination || origin.city.id === destination.city.id) continue

    const score = origin.score + destination.score
    if (score > bestScore) {
      best = { origin, destination }
      bestScore = score
    }
  }

  return best
}
