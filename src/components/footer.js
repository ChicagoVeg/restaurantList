import React from 'react';
import PropTypes from 'prop-types';

const Footer = props =>  {
    const {orgName, links} = props.details;
    const linkItems = links.map((link, i) => {
        return (<li key={i}>
            <a href={link.url}>{link.text}</a>                                    
        </li>)
    });

    return (
        <footer>
            <div className="container">
                <div className="row">
                     <div className="col-sm-8">
                        <p>{orgName}</p>
                        <ul>
                            {linkItems}
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