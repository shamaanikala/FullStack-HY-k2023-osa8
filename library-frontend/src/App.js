import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import LoginForm from './components/LoginForm'
import { useApolloClient, useSubscription } from '@apollo/client'
import Recommendations from './components/Recommendations'
import { ALL_BOOKS, AUTHOR_NAMES, BOOK_ADDED } from './queries'

export const updateCache = (cache, query, addedBook) => {
  const uniqueId = book => {
    let seen = new Set()
    return book.filter(b => {
      let c = b.id
      return seen.has(c) ? false : seen.add(c)
    })
  }

  cache.updateQuery(query, ({ allBooks }) => {
    return {
      allBooks: uniqueId(allBooks.concat(addedBook)),
    }
  })
}

export const updateAuthorsCache = (cache, query, addedBook) => {
  const uniqueId = author => {
    let seen = new Set()
    return author.filter(b => {
      let c = b.id
      return seen.has(c) ? false : seen.add(c)
    })
  }

  cache.updateQuery(query, ({ allAuthors }) => {
    return {
      allAuthors: uniqueId(allAuthors.concat(addedBook.author)),
    }
  })
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const client = useApolloClient()

  useSubscription(BOOK_ADDED, {
    onData: ({ data }) => {
      const bookAdded = data.data.bookAdded
      window.alert(`New book '${data.data.bookAdded.title}' added!`)
      console.log(data)
      // console.log(`kirja: ${data.data.bookAdded.title}`)
      updateCache(client.cache, { query: ALL_BOOKS }, data.data.bookAdded)
      updateAuthorsCache(client.cache, { query: AUTHOR_NAMES }, bookAdded)
    },
  })
  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
    if (page === 'add' || page === 'recommend') {
      setPage('authors')
    }
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token && <button onClick={() => setPage('add')}>add book</button>}
        {token && (
          <button onClick={() => setPage('recommend')}>recommend</button>
        )}
        {!token && <button onClick={() => setPage('login')}>login</button>}
        {token && <button onClick={logout}>logout</button>}
      </div>

      <Authors show={page === 'authors'} token={token} />

      <Books show={page === 'books'} />
      <NewBook show={page === 'add'} setPage={setPage} />
      <Recommendations show={page === 'recommend'} token={token} />
      <LoginForm
        show={page === 'login'}
        setToken={setToken}
        setPage={setPage}
      />
    </div>
  )
}

export default App
