class AboutView {
	constructor() {
		this.container = document.querySelector("#main-content");
	}

	render() {
		this.container.innerHTML = `
        <section class="container">
          <h1>About Page</h1>
        </section>
      `;
		return this.container;
	}
}

export default AboutView;
