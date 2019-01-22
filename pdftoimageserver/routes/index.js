
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
          file.mv(path, err=>{
            if(err){
              res.send(err);
            }else{
              var PDFImage = require("pdf-image").PDFImage;
              var pdfImage = new PDFImage(path);
              console.log(pdfImage);
              pdfImage.convertFile().then(function (imagePaths) {
                //console.log('imagePath:',imagePath);
                // 0-th page (first page) of the slide.pdf is available as slide-0.png
                
                res.send(imagePaths.join());
              }).catch(err=>{
                console.log(err);
                res.send(err);
              });
              
            }
          })
          



          // console.log(req.files, pdfImage);
          // res.send("works!!");
      });
    };
  })();