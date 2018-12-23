import React, { Component } from 'react';
import 'bootstrap/dist/css/bootstrap.css';
import '../styles/App.scss';
import Footer from  './footer';

class App extends Component {
  constructor() {
    super();
    this.state = { 
      'header': {
        'title': 'Chicagoland Vegetarian, Vegan and Raw Restaurants',
        'brandLogoUrl': '../images/brand.jpg'
      },
       'footer': { 
        'orgName': 'ChicagoVeg', 
          'links': [
            {
              'url': 'http://www.chicagoveg.com',
              'text': 'ChicagoVeg Link'
            }
          ], 
        }
      };  
  };

  render() {
    return (
      <div className="App">
        <section>
          <article>
            <header>
              <nav className="navbar navbar-default navbar-fixed-top">
                <div className="navbar-header">
                  <a href="/" class="navbar-brand pull-left">
                    <img className="brand" src="../images/brand.jpg" alt="ChicagoVeg Restaurants" title="ChicagoVeg Restaurants" width="209" height="154" />
                  </a>
                </div>
                <div>
                <span>
                  {this.state.header.title}
                </span>  
              </div>
              </nav>
            </header>
            <div>
              <div className= "container">
                <div className="row">
                  <div className="col-md-5">
                  List
                  </div>
                  <div className="col-md-7">
                    Map
                  </div>
                </div>
              </div>
            </div>
            <Footer details={this.state.footer}></Footer>
            </article>
        </section>
        </div>
    );
  }
}

export default App;
