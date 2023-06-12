import { useQuery, useLazyQuery } from '@apollo/client'
import { ALL_BOOKS, ALL_GENRES } from '../queries'
import { useEffect, useState } from 'react'
import Genres from './Genres'

const parseGenres = query => {
  // query.data.allBooks sisältää taulukon olioita, joissa on
  // kussakin taulukko genres. Ladataan nämä yksittäiset genret
  // JavaScriptin joukkoon:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Set

  let genreSet = new Set()
  for (const bookObject of query) {
    for (const genre of bookObject.genres) {
      genreSet.add(genre)
    }
  }
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/from
  const result = Array.from(genreSet)
  return result
}

const Books = props => {
  const [genres, setGenres] = useState([])
  const [genreSelection, setGenreSelection] = useState(null)
  const genresQuery = useQuery(ALL_GENRES)

  // Otetaan mallia Apollon manuaalista, miten haetaan muuttujan kanssa
  // ja miten haetaan sen muuttuessa refetchillä:
  // https://www.apollographql.com/docs/react/data/queries/#configuring-fetch-logic
  // useLazyQuery niin päätetään itse milloin haetaan eikä tarvitse luottaa
  // Reactin hakuun.
  const [getBooksByGenre, result] = useLazyQuery(ALL_BOOKS)

  useEffect(() => {
    genresQuery.loading
      ? setGenres(['loading...'])
      : setGenres(parseGenres(genresQuery.data.allBooks).concat('all genres'))
    // pakko kutsua useLazyQuerya itse nyt
    getBooksByGenre()
  }, [setGenres, genresQuery]) // eslint-disable-line

  const genreFilter = selectedGenre => {
    console.log('genreFilter', selectedGenre)
    selectedGenre === 'all genres'
      ? setGenreSelection(null)
      : setGenreSelection(selectedGenre)
  }

  // tämä hoitaa useLazyQueryn vaatiman uudelleenhaun
  // toimitaan heti kun radion valinta muuttuu eikä
  // odoteta Reactin tilan päivitystä
  const handleChecked = target => {
    target !== 'all genres'
      ? getBooksByGenre({ variables: { genre: target } })
      : getBooksByGenre()
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
        handleChecked={handleChecked}
      />
    </div>
  )
}

export default Books
