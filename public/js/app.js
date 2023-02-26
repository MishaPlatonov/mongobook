const elems = document.querySelectorAll('.card-content');
const carts = document.querySelectorAll('.card .card-action')

function equalHeight(arr){
  let len = 0;
  arr.forEach(elem =>{
    if(elem.offsetHeight > len) len = elem.offsetHeight;
  });
  arr.forEach(elem=>elem.style.height = len+"px");
}

equalHeight(elems);
equalHeight(carts);
// Форматирование data  uk-UK
const parseDate = date =>{
  return new Intl.DateTimeFormat('uk-UK', {
    year:"numeric",
    month:"long",
    day:"2-digit",
    hour:"2-digit",
    minute:"2-digit",
    second:"2-digit",
  }).format(new Date(date))
}

document.querySelectorAll('.date b').forEach(el=>{
  el.textContent = parseDate(el.textContent);
});


// Кнопка "Удалить"
const cart = document.querySelector('#cart');
if(cart){
  cart.addEventListener('click', e =>{
    if(e.target.classList.contains('bk-remove')){
      const id = e.target.dataset.id;
      const csrf = e.target.dataset.csrf;
      fetch('/cart/remove/' + id, {method:'delete', headers:{'X-XSRF-TOKEN':csrf}})
        .then(res => res.json())
        .then(basket => {
          if(basket.books.length){
            const html = basket.books.map(b =>{
              return `
                <tr>
                  <td>${b.title}</td>
                  <td>${b.count}</td>
                  <td>${b.price}</td>
                  <td>
                  <button class="btn btn-small bk-remove" data-csrf="${csrf}" data-id="${b._id}">Удалить</button>
                  </td>
                </tr>
              `;
            }).join('');
            cart.querySelector('tbody').innerHTML = html;
            cart.querySelector('.basket-price span').textContent = basket.price;
          }
          else{
            cart.innerHTML = `
              <div class="basket-empty">
                <p>Корзина пуста :(</p>
                <img src="/img/empty-basket.png">
                <a href="/">Вернуться на главную</a>
              </div>
            `;
          }
        });
    }
  });
}

// Регистрация табов
M.Tabs.init(document.querySelectorAll('.tabs'));