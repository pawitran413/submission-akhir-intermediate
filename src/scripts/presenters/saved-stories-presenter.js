import IndexedDbHelper from "../utils/indexed-db-helper";
import SavedStoriesView from "../views/saved-stories-view";

class SavedStoriesPresenter {
  constructor() {
    this.view = new SavedStoriesView();
  }

  async init() {
    this.view.render();
    this.view.showLoading();
    await this.loadStories();
    this.view.bindClearStories(() => this.handleClearStories());
  }

  async loadStories() {
    try {
      const stories = await IndexedDbHelper.getAllStories();
      this.view.hideLoading();
      this.view.displayStories(stories);
      this.view.bindDeleteStoryButtons(stories, (id) => this.handleDeleteStory(id));
    } catch (error) {
      this.view.showError("Failed to load saved stories.");
    }
  }

  async handleDeleteStory(id) {
    await IndexedDbHelper.deleteStory(id);
    await this.loadStories();
  }

  async handleClearStories() {
    await IndexedDbHelper.clearAllStories();
    await this.loadStories();
  }
}

export default SavedStoriesPresenter; 