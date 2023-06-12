import { useQuery } from '@apollo/client'
import { ALL_GENRES } from '../queries'
import { useEffect, useState } from 'react'

const parseGenres = query => {
  // query.data.allBooks sisältää taulukon olioita, joissa on
  // kussakin taulukko genres. Ladataan nämä yksittäiset genret
  // JavaScriptin joukkoon:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

  let genreSet = new Set()
  console.log(query)
  for (const bookObject of query) {
    for (const genre of bookObject.genres) {
      genreSet.add(genre)
    }
  }
  console.log(genreSet)
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
  const result = Array.from(genreSet)
  return result
}

const Genres = props => {
  const [genres, setGenres] = useState([])
  const genresQuery = useQuery(ALL_GENRES)
  console.log(genresQuery)

  useEffect(() => {
    genresQuery.loading
      ? setGenres(['loading...'])
      : setGenres(parseGenres(genresQuery.data.allBooks))
  }, [setGenres, genresQuery]) // eslint-disable-line

  console.log(genres)

  if (!props.show) {
    return null
  }

  return (
    <div>
      <h3>genret</h3>
      <ul>
        {genres.map(genre => (
          <li key={genre}>{genre}</li>
        ))}
      </ul>
      <h3>{genres.length}</h3>
    </div>
  )
}

export default Genres
