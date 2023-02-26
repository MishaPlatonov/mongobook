const path = require('path');
const fs = require('fs');
const pathFile = path.join(path.dirname(process.mainModule.filename), 'data', 'basket.json');

class Basket{
  static async add(book){
    const basket = await Basket.fetchData();
    const unit = basket.books.findIndex(bs => bs.id === book.id);
    const bookRev = basket.books[unit];
    if(bookRev){
      //Книга уже есть в корзине
      bookRev.count++;
      basket.books[unit] = bookRev;
    }
    else{
      //Книгу нужно добавить в корзину
      book.count = 1;
      basket.books.push(book);
    }
    basket.price *= 1;
    book.price *= 1;
    basket.price += book.price;
    return new Promise((res, rej)=>{
      fs.writeFile(pathFile, JSON.stringify(basket), 
        (err, data)=>{
          if(err) rej(err);
          else res();
        }
      );
    });
  }

  static async fetchData(){
    return new Promise((res, rej)=>{
      fs.readFile(pathFile, 'utf-8', (err, data)=>{
          if(err) rej(err);
          else res(JSON.parse(data));
        }
      );
    });
  }

  static async remove(id){
    const basket = await Basket.fetchData();
    const unit = basket.books.findIndex(bs => bs.id === id);
    const oneBook = basket.books[unit];
    if(oneBook.count === 1){
      // удаляем книгу с помощью метода filter
      basket.books = basket.books.filter(bs => bs.id !== id);
    }
    else{
      //уменьшаем количество одинаковых книг в корзине
      basket.books[unit].count--;
    }
    basket.price -= oneBook.price;
    return new Promise((res, rej)=>{
      fs.writeFile(pathFile, JSON.stringify(basket),  err=>{
          if(err) rej(err);
          else res(basket);
        }
      
      );
    });
  }
}



module.exports = Basket;