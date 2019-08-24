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
            return 'VG'
        } else if (type === 'vegetarian') {
            return 'VT';
        } else  if (type === 'user') {
            return 'U';
        } else  if (type === 'not verified') {
            return 'NV';
        } else {
            return '';
        } 
    }, 
    colorCode: function(type) {
        const code = this.code(type)

        if (code === 'RV') {
            return '0000FF';
        } else if (code === 'VG') {
            return '00FF00'
        } else if (code === 'VT') {
            return 'FF8000';
        } else if (code === 'U') { 
            return 'FFFFFF';
        } else if (code === 'NV') { 
            return '422663';
        } else {
            console.warn(`Unknown type. Provided: ${type}`);
            return 'FFFFFF'; 
        } 
    },
    getIconDetails: function(type) {
        const code = this.code(type);
        const colorCode = this.colorCode(type);

        return {
            code, 
            colorCode
        };
    },
    getColorClass: function(type) {
        const code = this.code(type);
        let className = '';

        if (code === 'VG'){
            className  = 'vegan-token';
        } else if (code === 'VT') {
            className = 'vegetarian-token' 
        } else if (code === 'RV') {
            className = 'raw-vegan-token';
        } else if (code === 'NV') {
            className = 'not-verified-token';
        } else {
            console.log(`Received an unknown type: ${type}`);
        }
        return className;
    }
}