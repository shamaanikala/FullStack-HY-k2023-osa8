const Genres = ({ genres, genreSelection, genreFilter }) => {
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
                  checked={
                    genre === genreSelection ||
                    (!genreSelection && genre === 'all genres')
                      ? true
                      : false
                  }
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

export default Genres
