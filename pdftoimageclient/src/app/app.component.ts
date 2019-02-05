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
  myUploader(event){
    console.log('event', event);
    let myFile:any = event.files[0];
    let name = myFile.name.split('.pdf')[0];
    //var loadingTask = pdfjsLib.getDocument(rawData);
    var bytes:any = [];
    var reader = new FileReader();
    reader.onload =  async () =>{
      bytes = reader.result;
      let rawData = new Uint8Array(bytes);
      var pdfDocument = await PDFJS.getDocument(rawData);
      console.log('# PDF document loaded.',pdfDocument.numPages);
      let files = [];
      for(let i=1; i<= pdfDocument.numPages ; i++){
        // Fetch the page
        const page = await pdfDocument.getPage(i);
        $('<canvas />', { id: `pdf-canvas${i}` }).appendTo('body');
        let canvas = $(`#pdf-canvas${i}`).get(0);
        let canvas_ctx = canvas.getContext('2d');
        // As the canvas is of a fixed width we need to set the scale of the viewport accordingly
        var scale_required = canvas.width / page.getViewport(1).width;

        // Get viewport of the page at required scale
        var viewport = page.getViewport(scale_required);

        // Set canvas height
        canvas.height = viewport.height;

        var renderContext = {
          canvasContext: canvas_ctx,
          viewport: viewport
        };
        
        // Render the page contents in the canvas
        await page.render(renderContext)
        let url = $(`#pdf-canvas${i}`).get(0).toDataURL();
        let file = await this.urltoFile(url,`${name}-file${i}.png`,url.split(';')[0].split(':')[1]);
        files.push(file);
      }
      console.log('data:', {files: files});    
      this.makeFileRequest(`${this.base}upload`, [], files).then((result) => {
            console.log(result);
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

