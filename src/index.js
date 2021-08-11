const quoteList = document.querySelector('#quote-list')
const sortOption = document.querySelector('#sort')

window.addEventListener('DOMContentLoaded', () => {
  fetchQuotesAndRender()
})

const fetchQuotesAndRender = async () => {
  quoteList.innerHTML = ''
  const res = await fetch('http://localhost:3000/quotes?_embed=likes')
  const quotes = await res.json()
  if (sortOption.checked) {
    quotes.sort((a, b) => a.author.localeCompare(b.author))
    console.log(quotes)
  }
  quotes.forEach(renderQuote)
}


const renderQuote = ({ quote, author, id, likes = undefined }) => {
  const quoteLi = document.createElement('li')
  quoteLi.classList.add('quote-card')
  const likesCount = likes ? likes.length : 0
  quoteLi.innerHTML = `
  <blockquote class="blockquote">
  <p class="mb-0">${quote}</p>
  <footer class="blockquote-footer">${author}</footer>
  <br>
  <button class='btn-success like'>Likes: <span id="likes-count">${likesCount}</span></button>
  <button class='btn-success edit'>Edit</button>
  <button class='btn-danger'>Delete</button>
  </blockquote>
  <div class="edit-form-container" style="display: none;">
  <form class="edit-form" data-id="${id}">
    <label for="quote">Quote:</label>
    <input id="quote" name="quote" placeholder="${quote}"/><br>
    <label for="author">Author:</label>
    <input id="author" name="author" placeholder="${author}"/>
    <input type="submit" value="Submit Changes"/>
  </form>
  <br>
  <button class="cancel-edit">Cancel</button>
  </div>
  `
  quoteLi.dataset.id = id
  quoteList.append(quoteLi)  
}

document.querySelector('#new-quote-form').addEventListener('submit', async (e) => {
  e.preventDefault()
  const body = {
    quote: e.target.quote.value,
    author: e.target.author.value
  }
  const res = await fetch('http://localhost:3000/quotes', fetchConfig('POST', body))
  
  const newQuote = await res.json()
  renderQuote(newQuote)
})

quoteList.addEventListener('click', (e) => {
  if (e.target.matches('.btn-danger')) {
    const quoteDisplay = e.target.closest('li')
    fetch(`http://localhost:3000/quotes/${quoteDisplay.dataset.id}`, {
      method: 'DELETE'
    })
    quoteDisplay.remove()
  }
})

quoteList.addEventListener('click', (e) => {
  if (e.target.matches('.btn-success.like')) {
    const targetQuote = e.target.closest('li')
    const quoteId = parseInt(targetQuote.dataset.id)
    const body = { 
      quoteId,
      createdAt: Date.now() 
    }
    
    fetch('http://localhost:3000/likes', fetchConfig('POST', body))

    let likesDisplay = targetQuote.querySelector('#likes-count')
    let likesCount = parseInt(likesDisplay.textContent)
    likesDisplay.textContent = likesCount + 1
  }
})

quoteList.addEventListener('click', (e) => {
  if (e.target.matches('.btn-success.edit') || e.target.matches('.cancel-edit')) {
    toggleEditForm(e)
  }
})

quoteList.addEventListener('submit', (e) => {
  e.preventDefault()
  const body = {
    quote: e.target.quote.value,
    author: e.target.author.value
  }
  fetch(`http://localhost:3000/quotes/${e.target.dataset.id}`, fetchConfig('PATCH', body))
  const quoteDisplay = e.target.closest('li')
  quoteDisplay.querySelector('.mb-0').textContent = body.quote
  quoteDisplay.querySelector('.blockquote-footer').textContent = body.author
  toggleEditForm(e)
})

const toggleEditForm = e => {
  let targetQuote = e.target.closest('li')
  if (e.target.matches('.cancel-edit') || e.target.matches('.edit-form')) {
    targetQuote.querySelector('blockquote').style.display = 'block'
    targetQuote.querySelector('.edit-form-container').style.display = 'none' 
  }
  if (e.target.matches('.btn-success.edit')) {
    targetQuote.querySelector('blockquote').style.display = 'none'
    targetQuote.querySelector('.edit-form-container').style.display = 'block'
  }
}

sortOption.addEventListener('change', (e) => {
  fetchQuotesAndRender()
})

const fetchConfig = (method, body) => {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body)
  }
}
