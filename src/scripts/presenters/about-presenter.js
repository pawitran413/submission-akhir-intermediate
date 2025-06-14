class AboutPresenter {
	constructor({ view }) {
		this.view = view;
	}

	async init() {
		this.view.render();
	}
}

export default AboutPresenter;
