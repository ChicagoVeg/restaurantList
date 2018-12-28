import React from 'react';
import PropTypes from 'prop-types';

const Footer = props =>  {
    const {orgName, links} = props.details;
    
    const socialMediaPost = (socialMedia) => {
        //based on: http://blog.socialsourcecommons.org/2011/03/creating-share-this-on-facebooktwitter-links/
        window.open(
            `${socialMedia.url}`, 
            '_blank', 
            `toolbar=no,   
            scrollbars=yes, 
            resizable=yes, 
            top=${socialMedia.top},
            left=${socialMedia.left}, 
            width=${socialMedia.width},
            height=${socialMedia.height}`);
    }

    return (
        <footer>
            <div className="container">
                <div className="row">
                     <div className="col-sm-8">
                        <p>{orgName}</p>
                        <ul>
                            <li>
                                <button 
                                    onClick={() => socialMediaPost({
                                        'url': 'http://www.facebook.com/sharer.php?u=http://restaurants.chicagoveg.com', 
                                        'top':'500', 
                                        'left':'500', 
                                        'width':'400', 
                                        'height':'400', 
                                    })} 
                                    type="button"
                                >
                                    <img alt="post-to-facebook" src={require('./../images/facebook.png')} />
                                </button>
                            </li>
                            <li>  
                                <button 
                                    onClick={() => socialMediaPost({
                                        'url': 'http://twitter.com/share?text=List%20of%20Chicagoland Vegan,%20Vegetarian%20and%20Raw%20Vegan%20Restaurants&amp;url=', 
                                        'top':'500', 
                                        'left':'500', 
                                        'width':'400', 
                                        'height':'400',                             
                                    })} 
                                    type="button"
                                >
                                    <img alt="post-to-twitter" src={require('./../images/twitter.png')} />
                                </button>
                            </li>
                            <li>  
                                <a href="mailto:restaurants@chicagoveg.com?Subject=Feedback on Restaurant Application" target="_blank">
                                    <img alt="email-others-about-veg-restaurants" src={require('./../images/email.png')} />
                                </a>
                            </li>
                        </ul> 
                     </div>
                     <div className="col-sm-4">
                     </div>
                </div>
            </div>
        </footer>
    );
}

Footer.propTypes = {
    'orgName': PropTypes.string,
    'links': PropTypes.array,
    'socialMedia': PropTypes.array,
}

Footer.defaultProps = {
    'orgName': '',
    'links': [],
    'socialMedia': [],
}

export default Footer