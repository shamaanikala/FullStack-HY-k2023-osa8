import { useQuery } from '@apollo/client'
import { ALL_AUTHORS } from '../queries'
import { useState } from 'react'

const SetBirthyearForm = () => {
  const [name, setName] = useState('')
  const [born, setBorn] = useState('')

  const submit = async event => {
    event.preventDefault()
    console.log('update author')
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          name{' '}
          <input
            value={name}
            onChange={({ target }) => setName(target.value)}
          />
        </div>
        <div>
          born{' '}
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(target.value)}
          />
        </div>
        <button type="submit">update author</button>
      </form>
    </div>
  )
}

const Authors = props => {
  const result = useQuery(ALL_AUTHORS) // hookki pakko olla jo täällä
  if (!props.show) {
    return null
  }
  //const authors = []
  const authors = result.loading ? [] : result.data.allAuthors

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map(a => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <SetBirthyearForm />
    </div>
  )
}

export default Authors
