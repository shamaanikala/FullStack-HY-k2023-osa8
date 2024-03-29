import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { ALL_AUTHORS, ALL_BOOKS, ALL_GENRES, CREATE_BOOK } from '../queries'

const NewBook = props => {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [published, setPublished] = useState('')
  const [genre, setGenre] = useState('')
  const [genres, setGenres] = useState([])

  const [createBook] = useMutation(CREATE_BOOK, {
    onError: error => console.log(error),
    refetchQueries: [ALL_AUTHORS, ALL_GENRES],
    update: (cache, response) => {
      cache.updateQuery({ query: ALL_BOOKS }, ({ allBooks }) => {
        return {
          allBooks: allBooks.concat(response.data.addBook),
        }
      })
    },
    // päivitetää välimuistia tällä
    onQueryUpdated(observalbeQuery) {
      return observalbeQuery.refetch()
    },
  })

  if (!props.show) {
    return null
  }

  const setPage = props.setPage

  const submit = async event => {
    event.preventDefault()

    // Jos lommakkeella painetaan Enter kun genre kentässä on tekstiä
    // lisätään tällöin genre genrelistaan eikä vielä lähetetä lomaketta.
    // Jos genrekenttä on tyhjä, lähetetään lomake.
    if (genre.length > 0) {
      return addGenre()
    }

    // console.log('add book...')
    createBook({ variables: { title, author, published, genres } })

    setTitle('')
    setPublished('')
    setAuthor('')
    setGenres([])
    setGenre('')

    setPage('authors')
  }

  const addGenre = () => {
    setGenres(genres.concat(genre))
    setGenre('')
  }

  return (
    <div>
      <form onSubmit={submit}>
        <div>
          title
          <input
            value={title}
            onChange={({ target }) => setTitle(target.value)}
          />
        </div>
        <div>
          author
          <input
            value={author}
            onChange={({ target }) => setAuthor(target.value)}
          />
        </div>
        <div>
          published
          <input
            type="number"
            value={published}
            onChange={({ target }) => setPublished(Number(target.value))}
          />
        </div>
        <div>
          <input
            value={genre}
            onChange={({ target }) => setGenre(target.value)}
          />
          <button onClick={addGenre} type="button">
            add genre
          </button>
        </div>
        <div>genres: {genres.join(' ')}</div>
        <button type="submit">create book</button>
      </form>
    </div>
  )
}

export default NewBook
