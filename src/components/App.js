import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';
import 'bootstrap/dist/css/bootstrap.css';
import Footer from './footer';
import List from './list';
import Map from './map';
import Search from './search';
import topics from '../services/topics';
import NotificationSystem from 'react-notification-system';
import 'font-awesome/css/font-awesome.min.css';

class App extends Component {
  constructor() {
    super();

    this.yelpData = null;
    this.notification = React.createRef();

    // default values for displaying page prior to data load
    this.state = {
      detailsFile: 'details-chicago-il.json',
      yelpData: 'yelp-data-chicago.json',
      header: {
        title: 'Vegetarian, Vegan and Raw Restaurants',
        brandLogoUrl: '',
      },
      footer: {
        orgName: '',
        links: [
          {
            url: '',
            text: '',
          },
        ],
      },
      map: {},
      restaurants: [],
    };

    this.notificationModal = this.notificationModal.bind(this);
    this.infoNotification = this.infoNotification.bind(this);
    this.warningNotification = this.warningNotification.bind(this);

    PubSub.subscribe(topics.warningNotification, this.warningNotification);
    PubSub.subscribe(topics.infoNotification, this.infoNotification);
  }

  /**
   *
   *
   * @memberof App
   * Note: Fetch API not needed since data is local to the app
   */
  componentDidMount() {
    const details = require(`./../data/${this.state.detailsFile}`);
    this.yelpData = require(`./../data/${this.state.yelpData}`);
    this.setState(details);
  }

  componentDidUpdate() {
    const details = Object.assign({}, this.state);
    PubSub.publish(topics.restaurantListAvailable, { 
      restaurants: details.restaurants,
      yelpData: this.yelpData,
    });
    PubSub.publish(topics.mapInitDetailsAvailable, {
      map: details.map,
      restaurants: details.restaurants,

    });
  }

  infoNotification(message, info) {
    if (message !== topics.infoNotification) {
      console.warn(`Unexpected subscription received. Expected: ${topics.infoNotification}. Received: ${message}`);
    }

    this.notificationModal({
      autoDismiss: 4,
      level: 'info',
      message: info,
      position: 'tc',
    }); 
  }

  warningNotification(message, warning) {
    if (message !== topics.warningNotification) {
      console.warn(`Unexpected subscription received. Expected: ${topics.warningNotification}. Received: ${message}`);
    }

    this.notificationModal({
      autoDismiss: 6,
      level: 'warning',
      message: warning,
      position: 'tc',
    }); 
  }

  notificationModal(options) {
    const notification = this.notification.current;
    notification.addNotification(options); 
  }

  render() {
    return (
      <div className="App">
        <section>
          <article>
          <NotificationSystem ref={this.notification} />
          </article>
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
                <Search />
              </div>
              <div className="container">
                <div className="row">
                  <div className="col-md-7">
                    <List />
                  </div>
                  <div className="col-md-5">
                    <Map />
                  </div>
                </div>
              </div>
            </div>
            <Footer details={this.state.footer} />
          </article>
        </section>
      </div>
    );
  }
}

App.propTypes = {
  detailsFile: PropTypes.string,
  details: PropTypes.object,
};

App.defaultProps = {
  detailsFile: 'details-chicago-il.json',
  details: {},
};

export default App;
