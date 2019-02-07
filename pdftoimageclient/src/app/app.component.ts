import { Component } from '@angular/core';
import * as PDFJS from 'pdfjs-dist/build/pdf';
import * as $ from 'jquery'
import { FileUploader } from 'ng2-file-upload';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent {
  title = 'pdftoimageclient';
  images: string[]= [];
  url = "http://localhost:8000/pdftoimage"
  base = "http://localhost:8000/";
  public uploader:FileUploader = new FileUploader({url: `${this.base}upload`});
  onBasicUpload(event){
    console.log(event);
    this.images = event.xhr.response.split(',');
  }
  getDiff(d1,d2=null){
    if(!d2)
      d2 = new Date();
      return `${(d2-d1)/1000} Seconds`;
  }
  myUploader(event){
    let ds = new Date();
    let d = new Date();
    //console.log('event', event);
    let myFile:any = event.files[0];
    let name = myFile.name.split('.pdf')[0];
    //var loadingTask = pdfjsLib.getDocument(rawData);
    var bytes:any = [];
    var reader = new FileReader();
    reader.onload =  async () =>{
      console.log('Time for reader to read file:', this.getDiff(d));
      d = new Date();
      bytes = reader.result;
      let rawData = new Uint8Array(bytes);
      var pdfDocument = await PDFJS.getDocument(rawData);
      console.log('Time PDFJS took to process pdf:', this.getDiff(d));
      d = new Date();
      //console.log('# PDF document loaded.',pdfDocument.numPages);
      let files = [];
      for(let i=1; i<= pdfDocument.numPages ; i++){
        // Fetch the page
        const page = await pdfDocument.getPage(i);
        $(`<div id="pdf-div${i}"><canvas id="pdf-canvas${i}"/></div>`).appendTo('body');
        let canvas = $(`#pdf-canvas${i}`).get(0);
        let wrapper = $(`#pdf-div${i}`).get(0);
        let canvas_ctx = canvas.getContext('2d');
        // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
        var scale_required = 4;//canvas.width / page.getViewport(1).width;
        let canExit = true,file;
        do{
          // Get viewport of the page at required scale
          var viewport = page.getViewport(scale_required);

          // Set canvas height
          //canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.width = "100%";
          canvas.style.height = "100%";
          wrapper.style.width = Math.floor(viewport.width/scale_required) + 'pt';
          wrapper.style.height = Math.floor(viewport.height/scale_required) + 'pt';
          var renderContext = {
            canvasContext: canvas_ctx,
            viewport: viewport
          };
          
          // Render the page contents in the canvas
          await page.render(renderContext)
          let url = $(`#pdf-canvas${i}`).get(0).toDataURL();
          file = await this.urltoFile(url,`${name}-file${i}.png`,url.split(';')[0].split(':')[1]);
          console.log(file,url);
          if(file.size > 3000000 && scale_required > 1){
            scale_required--;
            canExit = false;
          }else{
            canExit = true;
          }
        }while(!canExit)
       
        files.push(file);
        console.log(`Time to render page ${i}:`, this.getDiff(d));
        d = new Date();
      }
      //console.log('data:', {files: files});    
      this.makeFileRequest(`${this.base}upload`, [], files).then((result) => {
        console.log(`Time for API to save files:`, this.getDiff(d));
        console.log(`Total Time for processing:`, this.getDiff(ds));

            //console.log(result);
        }, (error) => {
            console.error(error);
        });
    };
    reader.readAsArrayBuffer(myFile);

  }
  urltoFile(url, filename, mimeType){
    return (fetch(url)
        .then(function(res){return res.arrayBuffer();})
        .then(function(buf){return new File([buf], filename, {type:mimeType});})
    );
  }
  makeFileRequest(url: string, params: Array<string>, files: Array<File>) {
    return new Promise((resolve, reject) => {
        var formData: any = new FormData();
        var xhr = new XMLHttpRequest();
        for(var i = 0; i < files.length; i++) {
            formData.append("uploads", files[i], files[i].name);
        }
        xhr.onreadystatechange = function () {
            if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                    resolve(JSON.parse(xhr.response));
                } else {
                    reject(xhr.response);
                }
            }
        }
        xhr.open("POST", url, true);
        xhr.send(formData);
    });
}

}

