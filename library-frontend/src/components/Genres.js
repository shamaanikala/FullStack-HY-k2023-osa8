const Genres = ({ genres, genreSelection, genreFilter, handleChecked }) => {
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
                  onChange={({ target }) => handleChecked(target.value)}
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
