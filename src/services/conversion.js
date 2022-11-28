// method, arrow function vs regular function declaration may have difference
// function scope (this) key. Keep that in mind.

export default {
  code: (typeValue) => {
    if (!typeValue) {
      return null;
    }

    const type = typeValue.toLowerCase();

    if (type === 'raw vegan') {
      return 'RV';
    } if (type === 'vegan') {
      return 'VG';
    } if (type === 'vegetarian') {
      return 'VT';
    } if (type === 'user') {
      return 'U';
    } if (type === 'not verified') {
      return 'NV';
    }
    return '';
  },
  colorCode(type) {
    const code = this.code(type);

    if (code === 'RV') {
      return '0000FF';
    } if (code === 'VG') {
      return '00FF00';
    } if (code === 'VT') {
      return 'FF8000';
    } if (code === 'U') {
      return 'FFFFFF';
    } if (code === 'NV') {
      return '422663';
    }
    console.warn(`Unknown type. Provided: ${type}`);
    return 'FFFFFF';
  },
  getIconDetails(type) {
    const code = this.code(type);
    const colorCode = this.colorCode(type);

    return {
      code,
      colorCode,
    };
  },
  getColorClass(type) {
    const code = this.code(type);
    let className = '';

    if (code === 'VG') {
      className = 'vegan-token';
    } else if (code === 'VT') {
      className = 'vegetarian-token';
    } else if (code === 'RV') {
      className = 'raw-vegan-token';
    } else if (code === 'NV') {
      className = 'not-verified-token';
    } else {
      console.log(`Received an unknown type: ${type}`);
    }
    return className;
  },
};
