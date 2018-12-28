// method, arrow function vs regular function declaration may have difference 
// function scope (this) key. Keep that in mind.

export default {
    code: type => {
        if (!type) {
            return null;
        }

        type = type.toLowerCase();

        if (type === 'raw vegan') {
            return 'RV';
        } else if (type === 'vegan') {
            return 'V'
        } else if (type === 'vegetarian') {
            return 'VG';
        } else {
            return '';
        } 
    }, 
    colorCode: function(type) {
        const code = this.code(type)

        if (code === 'RV') {
            return '0000FF';
        } else if (code === 'V') {
            return '00FF00'
        } else if (code === 'VG') {
            return 'FF8000';
        } else {
            console.warn(`Unknown type. Provided: ${type}`);
            return 'FFFFFF'; 
        } 
    },
    iconInfo: function(type) {
        const code = this.code(type);
        const colorCode = this.colorCode(type);

        return {
            code, 
            colorCode
        };
    },
    colorClass: function(type) {
        const code = this.code(type);
        let className = '';

        if (code === 'V'){
            className  = 'vegan-token';
        } else if (code === 'VG') {
            className = 'vegetarian-token' 
        } else if (code === 'RV') {
            className = 'raw-vegan-token';
        } else {
            console.log(`Received an unknown type: ${type}`);
        }
        return className;
    } 
}