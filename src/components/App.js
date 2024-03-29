import React, { Component } from 'react';
import PropTypes from 'prop-types';
import PubSub from 'pubsub-js';
import 'bootstrap/dist/css/bootstrap.css';
import NotificationSystem from 'react-notification-system';
import { Helmet } from 'react-helmet';
import Footer from './footer';
import List from './list';
import GoogleMaps from './googleMaps';
import SearchArea from './searchArea';
import topics from '../services/topics';
import 'font-awesome/css/font-awesome.min.css';

class App extends Component {
  constructor() {
    super();

    // ie 11 needs
    this.ie11Polyfills = this.ie11Polyfills.bind(this);
    this.ie11Polyfills();

    this.yelpData = null;
    this.notification = React.createRef();

    // default values for displaying page prior to data load
    this.state = {
      restaurantData: 'restaurants-chicago-il.json',
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
    const details = require(`./../data/${this.state.restaurantData}`);
    this.yelpData = require(`./../data/${this.state.yelpData}`);
    this.setState(details);
  }

  componentDidUpdate() {
    const details = { ...this.state };
    const restaurants = details.restaurants.filter((r) => r.closed !== 'true');
    PubSub.publish(topics.restaurantListAvailable, {
      restaurants,
      yelpData: this.yelpData,
    });
    PubSub.publish(topics.mapInitDetailsAvailable, {
      map: details.map,
      restaurants,

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

  // polyfills for IE11. Remove once ie11 is no longer relevant
  ie11Polyfills() {
    // Number.parseFloat
    if (Number.parseFloat === undefined) {
      Number.parseFloat = parseFloat;
    }

    // Number.parseFloat
    if (Number.parseint === undefined) {
      Number.parseInt = parseInt;
    }

    // trimend
    if (!String.prototype.trimEnd) {
      String.prototype.trimEnd = function () {
        if (String.prototype.trimRight) {
          return this.trimRight();
        } if (String.prototype.trim) {
          const trimmed = this.trim();
          const indexOfWord = this.indexOf(trimmed);

          return this.slice(indexOfWord, this.length);
        }
      };
    }

    // toggleAttribute
    if (!Element.prototype.toggleAttribute) {
      Element.prototype.toggleAttribute = function (name, force) {
        if (force !== void 0) force = !!force;

        if (this.getAttribute(name) !== null) {
          if (force) return true;

          this.removeAttribute(name);
          return false;
        }
        if (force === false) return false;

        this.setAttribute(name, '');
        return true;
      };
    }

    // Object.assign
    if (!Object.assign) {
      Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value(target) {
          if (target === undefined || target === null) {
            throw new TypeError('Cannot convert first argument to object');
          }

          const to = Object(target);
          for (let i = 1; i < arguments.length; i++) {
            let nextSource = arguments[i];
            if (nextSource === undefined || nextSource === null) {
              continue;
            }
            nextSource = Object(nextSource);

            const keysArray = Object.keys(Object(nextSource));
            for (let nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
              const nextKey = keysArray[nextIndex];
              const desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
              if (desc !== undefined && desc.enumerable) {
                to[nextKey] = nextSource[nextKey];
              }
            }
          }
          return to;
        },
      });
    }
  }

  render() {
    return (
      <div className="App">
        <Helmet>
          <meta charSet="utf-8" />
          <meta id="og-image" property="og:image" content={require('../images/chicagorestaurants.jpg')} />
          <meta id="og-image" property="og:image" content="http://chicagoveg.com/restaurants/Lib/Veg/dist/img/chicagorestaurants.jpg" />
        </Helmet>
        <section>
          <article>
            <NotificationSystem ref={this.notification} />
          </article>
          <article>
            <header>
              <nav>
                <div className="nav-brand">
                  <a href="/" className="navbar-brand pull-left">
                    <img
                      alt="ChicagoVeg Restaurants"
                      className="brand"
                      src={require('../images/brand.jpg')}
                      title="ChicagoVeg Restaurants"
                    />
                  </a>
                </div>
                <div className="nav-title mx-auto">
                  <h1 className="page-title">
                    {this.state.header.title}
                  </h1>
                </div>
              </nav>
            </header>
            <div>
              <div className="container">
                <SearchArea />
              </div>
              <div className="container">
                <div className="row">
                  <div className="col-md-7">
                    <GoogleMaps />
                  </div>
                  <div className="col-md-5">
                    <List />
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
  restaurantData: PropTypes.string,
  details: PropTypes.object,
};

App.defaultProps = {
  restaurantData: 'restaurants-chicago-il.json',
  details: {},
};

export default App;
