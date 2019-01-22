import { Component } from '@angular/core';

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
  onBasicUpload(event){
    console.log(event);
    this.images = event.xhr.response.split(',');
  }
}
