class SavedStoriesView {
  constructor() {
    this.container = document.querySelector("#main-content");
  }

  render() {
    this.container.innerHTML = `
      <section class="container" role="main">
        <header class="page-header">
          <h1>Saved Stories</h1>
          <button id="clear-saved-stories-button" class="btn btn-danger" style="margin-top: 1rem;">Clear All Saved Stories</button>
        </header>
        <div class="stories-container">
          <div class="stories-list" id="saved-stories-list">
            <div class="loading" id="loading-indicator" aria-live="polite">
              Loading saved stories...
            </div>
          </div>
        </div>
      </section>
    `;
    return this.container;
  }

  showLoading() {
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) loadingIndicator.style.display = "block";
  }

  hideLoading() {
    const loadingIndicator = document.getElementById("loading-indicator");
    if (loadingIndicator) loadingIndicator.style.display = "none";
  }

  showError(message) {
    const storiesContainer = document.getElementById("saved-stories-list");
    if (storiesContainer) {
      storiesContainer.innerHTML = `<div class="error-message" role="alert">${message}</div>`;
    }
  }

  displayStories(stories) {
    const storiesContainer = document.getElementById("saved-stories-list");
    if (!storiesContainer) return;
    if (stories.length === 0) {
      storiesContainer.innerHTML = "<p>No saved stories available</p>";
      return;
    }
    const storiesHTML = stories.map(story => `
      <article class="story-card" role="article">
        <div class="story-image">
          <img src="${story.photoUrl}" alt="Story photo by ${story.name}: ${story.description.substring(0, 100)}..." loading="lazy">
        </div>
        <div class="story-content">
          <h3 class="story-author">${story.name}</h3>
          <p class="story-description">${story.description}</p>
          <time class="story-date" datetime="${story.createdAt}">${story.createdAt}</time>
          <a href="#/story/${story.id}" class="story-link" aria-label="Read full story by ${story.name}">Read More</a>
          <button type="button" class="btn btn-danger delete-saved-story-btn" id="delete-saved-story-btn-${story.id}" data-story-id="${story.id}">Delete</button>
        </div>
      </article>
    `).join("");
    storiesContainer.innerHTML = storiesHTML;
  }

  bindClearStories(handler) {
    const clearButton = document.getElementById("clear-saved-stories-button");
    if (clearButton) clearButton.addEventListener("click", handler);
  }

  bindDeleteStoryButton(storyId, handler) {
    const btn = document.getElementById(`delete-saved-story-btn-${storyId}`);
    if (btn) btn.addEventListener("click", () => handler(storyId));
  }

  bindDeleteStoryButtons(stories, handler) {
    stories.forEach(story => {
      this.bindDeleteStoryButton(story.id, handler);
    });
  }
}

export default SavedStoriesView; 