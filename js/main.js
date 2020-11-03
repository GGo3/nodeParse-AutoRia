
// const os = require('os');

// const request = require("request");

// console.log(os.cpus());

// const fs = require('fs');

// try {
//   fs.readFileSync('1.text');
// } catch (oshibochka) {
//   console.log(oshibochka);
// };

// const EDGES = [1, 1234567890];
// const NUMBER_LENGHT = 10;
// const nullNumber = '0';

// console.time();
// try {
//   if (typeof(EDGES[0]) !== 'number' || typeof(EDGES[1]) !== 'number') throw 'values in EDGES is not a numbers';
//   if (EDGES[0] > EDGES[1]) throw ' start value in EDGES bigger then end value';
//   let tempNum = '';
//   for ( let i = EDGES[0]; i <= EDGES[1]; i++) {
//     if (String(i).length < NUMBER_LENGHT) {
//       let nullsForNum = NUMBER_LENGHT - String(i).length;
//       let nullsStr = nullNumber.repeat(nullsForNum);
//       tempNum = `${tempNum}
//       ${nullsStr}${i}`;
//     }
//   }
//   fs.writeFileSync('numbers.text', tempNum);
// } catch (oshibochka) {
//   console.log(oshibochka);
// };
// console.timeEnd();

// const request = require('request');

// request('https://dog.ceo/api/breeds/list/all', (e, r, body) => {
//   console.log(body);
//   const temp = JSON.parse(body);
//   const arr = Object.keys(temp.message);
//   console.log(arr);
// });

// парсить можно в CSV


// const http = require('http');


// const PORT = 3000;

// http.createServer((request, response) => {
//   response.write(String(Date.now()));
//   response.end();
// }).listen(PORT);

// делаем полезный сервер делать 
// 1. парсер парсит тесла, вдухмерный массив 

const request = require('request');


// Создаем двумерный массив который будет таблицей для информации

let arrParse = [['Model', 'year', 'USD', 'UAH']];

const tableColumns = 4;
const tableRows = 11;

for (let i = 1; i < tableRows; i++) {
  let tableSpaces = [];
  for (let k = 0; k < tableColumns; k++){
    tableSpaces[k] = null;
  };
  arrParse[i] = tableSpaces;
};



request('https://auto.ria.com/uk/search/?category_id=1&marka_id=2233&model_id=0&city%5B0%5D=0&state%5B0%5D=0&s_yers%5B0%5D=0&po_yers%5B0%5D=0&price_ot=&price_do=', function (error, response, body) {
  console.error('error:', error); 
  console.log('statusCode:', response && response.statusCode); 
  let arrStr = [];
  arrStr = body.split('class="blue bold">'); // получили массив из 12 кусков, 0 и 11 индекс в массиве в мусорку, юзаем только 1-10 
  arrStr.shift(); // тут удаляем 1 кусок
  arrStr.pop(); // тут 2

  // функция для нарезки строки в каждом куске

  const cutString = (cutElement) => {
    for (let r = 0; r < arrStr.length; r++) {
      arrStr[r] = arrStr[r].split(cutElement);
    };
  };

  // функция для удаления первого элемента в созданном массиве строки в каждом куске

  const delateCutElement = () => {
    for (let r = 0; r < arrStr.length; r++){
      arrStr[r].shift();
    };
  };

  // функция для объеденения массива снова в строку в каждом куске

  const joinArrToString = () => {
    for (let r = 0; r < arrStr.length; r++) {
      arrStr[r] = arrStr[r].join('');
    };
  };
  
  // функция для записи свойсва в таблицу

  const writePropertyInTable = (cutSymbol, indexColumnOfTable) => {
    for ( let k = 0; k < arrStr.length; k++) {
      let carProperty = '';
      i = 0;
      while(arrStr[k][i] !== cutSymbol) {
        carProperty = `${carProperty}${arrStr[k][i]}`
        i++;
      };
      if (indexColumnOfTable > 0) {
        if (carProperty.length > 4) {
          let price = carProperty.split(' ').join('');
          arrParse[k + 1][indexColumnOfTable] = Number(price);
        } else {
          arrParse[k + 1][indexColumnOfTable] = Number(carProperty);
        };
      } else {
        arrParse[k + 1][indexColumnOfTable] = carProperty;
      };
    }
  };

  writePropertyInTable('<', 0);
  cutString('</span>');
  delateCutElement();
  joinArrToString();
  writePropertyInTable('<', 1);
  cutString('data-currency="USD">');
  delateCutElement();
  joinArrToString();
  writePropertyInTable('&', 2);
  cutString('data-currency="UAH">');
  delateCutElement();
  joinArrToString();
  writePropertyInTable('&', 3);

  console.table(arrParse);

});
