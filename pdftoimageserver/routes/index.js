
(function IIFE() {
    'use strict';
  
    module.exports = function(app) {
      app.use(function(req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
        next();
      });
      app.post('/pdftoimage', (req, res)=>{
          let file = req.files.file;
          //let path = `./tmp/${file.name}`;
          let pathurl = `http://localhost:8000/tmp/${file.name}`;
          let path = `./tmp/input.pdf`;
          file.mv(path, err=>{
            if(err){
              res.send(err);
            }else{
              // var PDFImage = require("pdf-image").PDFImage;
              // var pdfImage = new PDFImage(path);
              // console.log(pdfImage);
              // pdfImage.convertFile().then(function (imagePaths) {
              //   //console.log('imagePath:',imagePath);
              //   // 0-th page (first page) of the slide.pdf is available as slide-0.png
                
              //   res.send(imagePaths.join());
              // }).catch(err=>{
              //   console.log(err);
              //   res.send(err);
              // });
              convert();
            }
          })
          function convert(){
            const puppeteer = require('puppeteer');
            (async () => {
              //https://download-chromium.appspot.com/
              const browser = await puppeteer.launch({executablePath: '../../chrome-mac/Chromium.app/Contents/MacOS/Chromium'});
              const page = await browser.newPage();
              await page.goto('http://localhost:8000/public/pdf.html');
              const imageUrls = await page.evaluate(() => showPDF())
              const urls = download(imageUrls,`${file.name.split('.')[0]}`);
              console.log(urls);
              await browser.close();
              res.send(urls.join());
            })();
          
          }
          const fs = require("fs");
          //  This is main download function which takes the url of your image
          function download(imageUrls, filename) {
            let urls = [];
            for(let i=0; i< imageUrls.length; i++){
              var base64Data = imageUrls[i].replace(/^data:image\/png;base64,/, "");
              fs.writeFileSync(`./tmp/${filename}-${i}.png`, base64Data, 'base64');
              urls.push(`tmp/${filename}-${i}.png`);
            }
            return urls;
          }
      });
    };
  })();