import { useMutation, useQuery } from '@apollo/client'
import { ALL_AUTHORS, AUTHOR_NAMES, SET_BIRTHYEAR } from '../queries'
import { useState } from 'react'
import Select from 'react-select'

const SetBirthyearForm = () => {
  const [born, setBorn] = useState('')

  const [errorMessage, setErrorMessage] = useState(null)

  const [setBirthyear] = useMutation(SET_BIRTHYEAR, {
    refetchQueries: [ALL_AUTHORS],
    onError: error => {
      console.log(error.message)
      //console.log(JSON.stringify(error))
      if (error.graphQLErrors[0].extensions.code === 'BAD_USER_INPUT') {
        if (error.message.includes('setBornTo')) {
          setErrorMessage('born input value invalid!')
        }
      } else {
        setErrorMessage(error.message)
      }
    },
  })

  const [selected, setSelected] = useState(null)

  const optionsQuery = useQuery(AUTHOR_NAMES)
  const options = optionsQuery.loading
    ? [{ value: 'loading', label: 'Loading...' }]
    : optionsQuery.data.allAuthors.map(e => ({
        value: e.name,
        label: e.name,
      }))

  const submit = async event => {
    event.preventDefault()
    console.log('update author')

    if (!selected) {
      setErrorMessage('Author must be selected!')
      return
    }

    setBirthyear({ variables: { name: selected.value, setBornTo: born } })
    setBorn('')
    setErrorMessage(null)
  }

  return (
    <div>
      <h3>Set birthyear</h3>
      <form onSubmit={submit}>
        <div>
          <div style={{ color: 'red' }}>{errorMessage}</div>
          <Select
            defaultValue={selected}
            onChange={setSelected}
            options={options}
            placeholder={'Select author...'}
          />
        </div>
        <div>
          born{' '}
          <input
            type="number"
            value={born}
            onChange={({ target }) => setBorn(Number(target.value))}
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
