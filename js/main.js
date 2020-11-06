// const request = require('request');
const moment = require('moment');
const http = require('http');
const fs = require('fs');
const PORT = 3000;
let tableStr = 'table';
let filename = '';



let arrParse = [['Model', 'year', 'USD', 'UAH']];

const tableColumns = 4;
const tableRows = 11;

let time = '';
const URL = 'https://auto.ria.com/uk/search/?category_id=1&marka_id=2233&model_id=0&city%5B0%5D=0&state%5B0%5D=0&s_yers%5B0%5D=0&po_yers%5B0%5D=0&price_ot=&price_do=';

http.createServer((req, res) => {
  console.log(req.url);
  const request = require('request');
    
    request(URL, function (error, response, body) {
      
      const parser = (htmlBody) => {
        
      // Создаем двумерный массив который будет таблицей для информации
    
      for (let i = 1; i < tableRows; i++) {
        let tableSpaces = [];
        for (let k = 0; k < tableColumns; k++){
        tableSpaces[k] = null;
        };
        arrParse[i] = tableSpaces;
      };
    
      let arrStr = [];
      arrStr = htmlBody.split('class="blue bold">'); // получили массив из 12 кусков, 0 и 11 индекс в массиве в мусорку, юзаем только 1-10 
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
    
      // функция генерации строки с двумерного массива
    
      let tempArr = [];
      let strCSV = '';
      const generateCSV = (arr) => {
        
        for (let i = 0; i < arr.length; i++) {  
          let tempStr = ''   
          for (let k = 0; k < arr[i].length; k++) {
            if ( i == 0) {
              tempStr = `${tempStr} ${arr[i][k]}`;
              if (k == 3) {
                tempStr = `${tempStr} ${arr[i][k]}\n`;
              }
            } else if (k == 0) {
              tempStr = `${tempStr} "${arr[i][k]}";`;
            } else if (k == 3) {
              tempStr = `${tempStr} ${arr[i][k]};\n`;
            } else {
              tempStr = `${tempStr} ${arr[i][k]};`;
            }
          }
          tempArr[i] = tempStr;
        }
        
        for (let r = 0; r < tempArr.length; r++) {
          strCSV = `${strCSV}${tempArr[r]}`;
        }
        
      }
      generateCSV(arrParse);
    
    
      // создаем переменную с moment.js будет её использовать для нейминга файла  
      
      let currentTime = () => {
        time = moment().format('YYYYMMDD-HHmmSS')
        }
        
      // создаем файл отпарсеной строки через встроенный модуль записи файла
        
      try {
        console.log('Файл создан')
        currentTime();
        filename = `tesla_${time}.csv`;
        fs.writeFileSync(filename, strCSV);
      } catch (err) {
        console.log("Ошибка создания файла:", err);
      };
      
      // функция создает HTML таблицу с расперсеного массива
     
    
      const genTableHTML = (arr) => {
        let trStr = '';
        
        for (let i = 0; i < arr.length; i++) {    
          let tdStr = '';
          for (let k = 0; k < arr[i].length; k++) {
            tdStr = `${tdStr}<td style="border: 1px solid black;">${arr[i][k]}</td>\n`;
          }
          trStr = `${trStr}<tr style="border: 1px solid black;">\n${tdStr}</tr>\n`;
        }
        tableStr = `<table style="border: 1px solid black;">\n${trStr}</table>\n`
        
    
        // console.log(tableStr);
      }
      
      genTableHTML(arrParse);
      console.log('Hi from parser');
      };
    
      parser(body);
      return tableStr;
    });
    
  if (req.url === '/tesla') {
    
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write(`<a href='/tesla'>Обновить данные по Тесле</a>\n`);
    res.write(`<p>${tableStr}</p>`);
    res.write(`<p><a href="/${filename}" download>Скачать файл</a></p>`);
    console.log('Hi from response');
  } else {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.write(`<a href='/tesla'>Обновить данные по Тесле</a>`);
  }
  if (req.url === `/${filename}` && filename.length !== 0) {
    res.setHeader('Content-Type', 'text/csv; charset=utf8');
    const csvcontent = fs.readFileSync(filename, 'utf8');
    res.write(csvcontent);
    }
  res.end();
}).listen(PORT);


// const testEl = document.querySelector('.test');

// const arrParse = [
//   [ 'Model', 'year', 'USD', 'UAH' ],
//   [ 'Tesla Model S ', 2017, 37500, 1074750 ],
//   [ 'Tesla Model S P90D Ludicrous', 2015, 41000, 1169730 ],
//   [ 'Tesla Model X 75D', 2016, 60800, 1743744 ],
//   [ 'Tesla Model S 85D', 2015, 36500, 1046455 ],
//   [ 'Tesla Model X ', 2017, 57500, 1648525 ],
//   [ 'Tesla Model S S85', 2014, 30888, 880926 ],
//   [ 'Tesla Model S 75', 2016, 35500, 1011040 ],
//   [ 'Tesla Model X 100D', 2018, 80900, 2310504 ],
//   [ 'Tesla Model X P100D Performance EU', 2020, 117529, 3339000 ],
//   [ 'Tesla Model 3 Dual Motors', 2019, 43888, 1251247 ]
// ]

// const genTableHTML = (arr) => {
//   let trStr = '';
//   let tableStr = '';
//   for (let i = 0; i < arr.length; i++) {    
//     let tdStr = '';
//     for (let k = 0; k < arr[i].length; k++) {
//       tdStr = `${tdStr}<td style="border: 1px solid black;">${arr[i][k]}</td>\n`;
//     }
//     trStr = `${trStr}<tr style="border: 1px solid black;">\n${tdStr}</tr>\n`;
//   }
//   tableStr = `<table style="border: 1px solid black;">\n${trStr}</table>\n`
  
//   testEl.innerHTML = tableStr;
//   // console.log(tableStr);
// }
// genTableHTML(arrParse);