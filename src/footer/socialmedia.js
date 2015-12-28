import {customAttribute, inject} from 'aurelia-framework';

@customAttribute('social-media')
@inject(Element)
export class socialMedia {
	constructor(element) {
    this.element = element;
  }

  	// TODO: quite hacky. binding is not needed, so read off values. Find a better way
  	attached() {
  		let parameter = JSON.parse((this.element.getAttribute('social-media')).replace(/'/g, '"'));

     this.element.addEventListener('click', () => {

       // Based on: http://blog.socialsourcecommons.org/2011/03/creating-share-this-on-facebooktwitter-links/
       window.open(parameter.url + 'http://restaurants.chicagoveg.com' , 
        '_blank', 
        'toolbar=no,' +  
        'scrollbars=yes,' + 
        'resizable=yes,' + 
        'top=' + parameter.top + ',' +
        'left=' + parameter.left + ',' + 
        'width=' + parameter.width + ',' +
        'height=' + parameter.height);
     })
   }
 }