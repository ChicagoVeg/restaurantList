import React, { Component } from 'react';
import PropTypes from 'prop-types'
import PubSub from 'pubsub-js';
import 'bootstrap/dist/css/bootstrap.css';
import Footer from  './footer';
import List from './list';
import Map from './map';
import Search from './search';
import topics from '../services/topics';

class App extends Component {
  constructor() {
    super();
    
    // default values for displaying page prior to data load
    this.state = { 
      'detailsFile': 'details-chicago-il.json',
      'header': {
        'title': 'Vegetarian, Vegan and Raw Restaurants',
        'brandLogoUrl': ''
      },
       'footer': { 
        'orgName': '', 
          'links': [
            {
              'url': '',
              'text': ''
            }
          ], 
        }, 
        'map': {}, 
        'restaurants': [],
      };  
  }
 
  /**
   *
   *
   * @memberof App
   * Note: Fetch API not needed since data is local to the app
   */
  componentDidMount() {
      const details = require(`./../data/${this.state.detailsFile}`);
      this.setState(details);
  }

  componentDidUpdate() {
    const details = Object.assign({}, this.state);
    PubSub.publish(topics.restaurantListAvailable, details.restaurants);
    PubSub.publish(topics.mapInitDetailsAvailable, {
      'map': details.map, 
      'restaurants': details.restaurants
    });
  }

  render() {
    return (
      <div className="App">
        <section>
          <article>
            <header>
              <nav className="navbar navbar-default navbar-fixed-top">
                <div className="navbar-header">
                  <a href="/" className="navbar-brand pull-left">
                    <img 
                      alt="ChicagoVeg Restaurants" 
                      className="brand" 
                      src={require('../images/brand.jpg')} 
                      title="ChicagoVeg Restaurants" 
                    />
                  </a>
                </div>
                <div className="mx-auto page-title">
                  <h2>    
                    {this.state.header.title}
                  </h2>
              </div>
              </nav>
            </header>
            <div>
              <div className="container">
                <Search></Search>
              </div>
              <div className= "container">
                <div className="row">
                  <div className="col-md-7">
                  <List></List>
                  </div>
                  <div className="col-md-5">
                    <Map></Map>
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

App.propTypes = {
  'detailsFile': PropTypes.string,
  'details': PropTypes.object,
}

App.defaultProps = {
  'detailsFile': 'details-chicago-il.json',
  'details': {},
}

export default App;
