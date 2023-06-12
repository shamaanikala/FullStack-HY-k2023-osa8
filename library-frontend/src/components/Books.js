import { useQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../queries'
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
  const genres = props.genres
  const genreSelection = props.genreSelection
  const genreFilter = props.genreFilter

  const handleChecked = (genreSelection, genre) => {
    // tämä on tarpeeton, mutta React haluaa, että inputissa
    // on onChange funktio, jotta input on kontrolloitu alusta asti
    // console.log('handleChecked', genre)
  }

  return (
    <div>
      <form onChange={({ target }) => genreFilter(target.value)}>
        <fieldset>
          <div>
            {genres.map(genre => (
              <span key={genre}>
                <input
                  type="radio"
                  value={genre}
                  id={genre}
                  checked={genre === genreSelection ? true : false}
                  onChange={({ target }) =>
                    handleChecked(genreSelection, target.checked)
                  }
                />
                <label>{genre}</label>
              </span>
            ))}
          </div>
        </fieldset>
      </form>
    </div>
  )
}

const Books = props => {
  const result = useQuery(ALL_BOOKS)

  const [genres, setGenres] = useState([])
  const [genreSelection, setGenreSelection] = useState('all genres')
  const genresQuery = useQuery(ALL_GENRES)

  useEffect(() => {
    genresQuery.loading
      ? setGenres(['loading...'])
      : setGenres(parseGenres(genresQuery.data.allBooks).concat('all genres'))
  }, [setGenres, genresQuery]) // eslint-disable-line

  const genreFilter = genre => {
    console.log('genreFilter', genre)
    setGenreSelection(genre)
  }

  if (!props.show) {
    return null
  }

  const books = result.loading ? [] : result.data.allBooks

  return (
    <div>
      <h2>books</h2>
      {genreSelection !== 'all genres' && (
        <p>Selected genre: {genreSelection}</p>
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
