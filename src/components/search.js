import React from 'react';
import PubSub from 'pubsub-js';

const Search = () => {
    const toggleAutoDetect = e => {
        const isChecked = e.target.checked;
        PubSub.publish('pubsub-address-auto-detect-toggled', isChecked)
    }

    return (
        <div className="input-group mb-3">
            <div className="input-group-prepend">
                <div className="input-group-text">
                    <label>
                        Auto Detect
                        <input type="checkbox" 
                            aria-label="Checkbox for following text input"
                            className="text-under-checkbox"
                            name="auto-detect-address"
                            onChange={toggleAutoDetect}
                            value="auto"
                        />
                    </label>
                </div>
            </div>
            <input
                aria-label="Main search box" 
                autoFocus 
                className="form-control"
                name="main-search"
                placeholder="Search by address"
                type="search"
                />
        </div>
    );
}

export default Search;
