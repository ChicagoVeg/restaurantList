export default {
    code: type => {
        if (!type) {
            return null;
        }

        type = type.toLowerCase();

        if (type === 'raw vegan') {
            return 'rawVegan';
        } else if (type === 'vegan') {
            return 'vegan'
        } else if (type === 'vegetarian') {
            return 'vegetarian';
        } else {
            return null
        } 
    }, 
    colorCode: type => {
        if (!type) {
            return null;
        }

        type = type.toLowerCase();

        if (type === 'raw vegan') {
            return '0000FF';
        } else if (type === 'vegan') {
            return '00FF00'
        } else if (type === 'vegetarian') {
            return 'FF8000';
        } else {
            console.warn(`Unknown type. Provided: ${type}`);
            return 'FFFFFF'; 
        } 
    }
}