
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
          let path = `./tmp/${file.name}`;
          let pdf_url = `http://localhost:8000/tmp/${file.name}`;
          //let path = `./tmp/input.pdf`;
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
              //console.log('html',html);
              //await page.setContent(`data:text/html,${html}`,{ waitUntil: 'networkidle2' });

              //let pdf_url = "http://localhost:8000/tmp/input.pdf";
              const imageUrls = await page.evaluate(async ({pdf_url}) => {
                let data = [];
                 
                  const pdf_doc = await PDFJS.getDocument({ url: pdf_url });
                    var __PDF_DOC = pdf_doc;
                    var __TOTAL_PAGES = __PDF_DOC.numPages;
                    
                      for(let i=1; i<= __TOTAL_PAGES ; i++){
                        // Fetch the page
                        const page = await __PDF_DOC.getPage(i);
                        $('<canvas />', { id: `pdf-canvas${i}` }).appendTo('body');
                        __CANVAS = $(`#pdf-canvas${i}`).get(0),
                        __CANVAS_CTX = __CANVAS.getContext('2d');
                        // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
                        var scale_required = __CANVAS.width / page.getViewport(1).width;

                        // Get viewport of the page at required scale
                        var viewport = page.getViewport(scale_required);

                        // Set canvas height
                        __CANVAS.height = viewport.height;

                        var renderContext = {
                          canvasContext: __CANVAS_CTX,
                          viewport: viewport
                        };
                        
                        // Render the page contents in the canvas
                        await page.render(renderContext)
                        data.push($(`#pdf-canvas${i}`).get(0).toDataURL());
                      }
                      return data;
              },{pdf_url});
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
          var html = `<!doctype html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <title>Pdftoimageclient</title>
            <base href="/">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <script src="https://ajax.googleapis.com/ajax/libs/jquery/2.2.4/jquery.min.js"></script>
            <script src="http://localhost:8000/public/pdf.js"></script>
            <script src="http://localhost:8000/public/pdf.worker.js"></script>
          </head>
          <body>
             
          </body>
          </html>`;
      });
    };
  })();