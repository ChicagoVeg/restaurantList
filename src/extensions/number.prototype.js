// based on: http://stackoverflow.com/a/29494612/178550
{
	Number.prototype.toFixedNumber = function(x, base){
		var pow = Math.pow(base||10,x);
		return +( Math.round(this*pow) / pow );
	}
}