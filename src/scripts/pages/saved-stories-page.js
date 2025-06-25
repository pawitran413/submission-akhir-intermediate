import SavedStoriesPresenter from "../presenters/saved-stories-presenter";

export default class SavedStoriesPage {
  async render() {
    return ""; // View akan di-render oleh presenter
  }

  async afterRender() {
    const presenter = new SavedStoriesPresenter();
    await presenter.init();
  }
} 