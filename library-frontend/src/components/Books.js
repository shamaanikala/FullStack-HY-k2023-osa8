import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../queries'
import { useEffect, useState } from 'react'
import Genres from './Genres'

const parseGenres = query => {
  // query.data.allBooks sisältää taulukon olioita, joissa on
  // kussakin taulukko genres. Ladataan nämä yksittäiset genret
  // JavaScriptin joukkoon:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

  let genreSet = new Set()
  // console.log(query)
  for (const bookObject of query) {
    for (const genre of bookObject.genres) {
      genreSet.add(genre)
    }
  }
  // console.log(genreSet)
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
  const result = Array.from(genreSet)
  return result
}

const Books = props => {
  const [genres, setGenres] = useState([])
  const [genreSelection, setGenreSelection] = useState(null)
  const genresQuery = useQuery(ALL_GENRES)

  useEffect(() => {
    genresQuery.loading
      ? setGenres(['loading...'])
      : setGenres(parseGenres(genresQuery.data.allBooks).concat('all genres'))
  }, [setGenres, genresQuery]) // eslint-disable-line

  const result = useQuery(ALL_BOOKS, {
    variables: { genreSelection },
  })
  // const result = useQuery(BOOKS_BY_GENRE)

  const genreFilter = genre => {
    console.log('genreFilter', genre)
    genre === 'all genres' ? setGenreSelection(null) : setGenreSelection(genre)
  }

  if (!props.show) {
    return null
  }

  const books = result.loading ? [] : result.data.allBooks

  return (
    <div>
      <h2>books</h2>
      {genreSelection && (
        <p>
          in genre <b>{genreSelection}</b>
        </p>
      )}
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map(a => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <Genres
        genreFilter={genreFilter}
        genres={genres}
        genreSelection={genreSelection}
      />
    </div>
  )
}

export default Books
