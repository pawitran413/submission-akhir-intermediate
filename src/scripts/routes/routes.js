// Models
import StoryModel from "../models/story-model";
import AuthModel from "../models/auth-model";

// Views
import HomeView from "../views/home-view";
import AboutView from "../views/about-view";
import LoginView from "../views/login-view";
import RegisterView from "../views/register-view";
import AddStoryView from "../views/add-story-view";
import StoryDetailView from "../views/story-detail-view";

// Presenters
import HomePresenter from "../presenters/home-presenter";
import AboutPresenter from "../presenters/about-presenter";
import LoginPresenter from "../presenters/login-presenter";
import RegisterPresenter from "../presenters/register-presenter";
import AddStoryPresenter from "../presenters/add-story-presenter";
import StoryDetailPresenter from "../presenters/story-detail-presenter";

const routes = {
	"/": {
		init: () => {
			const view = new HomeView();
			const model = new StoryModel();
			const presenter = new HomePresenter({ view, model });
			return presenter;
		},
	},
	"/about": {
		init: () => {
			const view = new AboutView();
			const presenter = new AboutPresenter({ view });
			return presenter;
		},
	},
	"/login": {
		init: () => {
			const view = new LoginView();
			const model = new AuthModel();
			const presenter = new LoginPresenter({ view, model });
			return presenter;
		},
	},
	"/register": {
		init: () => {
			const view = new RegisterView();
			const model = new AuthModel();
			const presenter = new RegisterPresenter({ view, model });
			return presenter;
		},
	},
	"/add-story": {
		init: () => {
			const view = new AddStoryView();
			const model = new StoryModel();
			const presenter = new AddStoryPresenter({ view, model });
			return presenter;
		},
	},
	"/story/:id": {
		init: () => {
			const view = new StoryDetailView();
			const model = new StoryModel();
			const presenter = new StoryDetailPresenter({ view, model });
			return presenter;
		},
	},
};

export default routes;
