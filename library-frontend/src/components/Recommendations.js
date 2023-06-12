import { useQuery } from '@apollo/client'
import { ALL_BOOKS, USER_INFO } from '../queries'
import { useEffect, useState } from 'react'

const Recommendations = props => {
  const [genre, setGenre] = useState(null)
  const result = useQuery(USER_INFO)
  const bookResult = useQuery(ALL_BOOKS, {
    variables: { genre },
  })

  useEffect(() => {
    if (props.token && result.data.me.favoriteGenre) {
      setGenre(result.data.me.favoriteGenre)
    }
  }, [props.token, result.data])

  if (!props.show) {
    return null
  }

  const favoriteGenre = result.loading
    ? 'loading...'
    : result.data.me.favoriteGenre

  const recommendedBooks = bookResult.loading ? [] : bookResult.data.allBooks

  return (
    <div>
      <h2>recommendations</h2>
      <div>
        books in your favorite genre <b>{favoriteGenre}</b>
      </div>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.map(a => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Recommendations
