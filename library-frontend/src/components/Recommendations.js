import { useQuery } from '@apollo/client'
import { USER_INFO } from '../queries'

const Recommendations = props => {
  const result = useQuery(USER_INFO)

  if (!props.show) {
    return null
  }

  const favoriteGenre = result.loading
    ? 'loading...'
    : result.data.me.favoriteGenre
  return (
    <div>
      <h2>recommendations</h2>
      <div>
        <p>
          books in your favorite genre <b>{favoriteGenre}</b>
        </p>
      </div>
    </div>
  )
}

export default Recommendations
