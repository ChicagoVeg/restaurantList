import {customAttribute, inject} from 'aurelia-framework';

@customAttribute('highlight-active-selection')
@inject(Element)
export class highlightActiveSelection {
	constructor(element) {
		this.element = element;
	}

	attached() {
		this.element.addEventListener('click', (e) => {
			let target = e.target, 
				trs;
			
			if (!target || target.type !== 'radio') {
				return;
			}

			//children[0] = tbody, tbody's children = tr's
			trs = target.closest('table').children[0].children

			for (let i = 0; i < trs.length; i++) {
				trs[i].classList.remove('selected-restaurant')
			}

			target.closest('tr').classList.add('selected-restaurant');
		});
	}
}