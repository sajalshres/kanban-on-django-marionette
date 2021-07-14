import { Collection, Model } from "backbone";

import api from "./services/api";

const AuthModel = Model.extend({
  defaults: {
    id: -1,
    logged_in: false,
  },

  initialize() {
    this.listenTo(this, "change:id", this.onUserChange);
  },

  setFromResponse(response) {
    if (response.csrftoken) {
      window.csrfToken = response.csrftoken;
      api.csrfToken = response.csrfToken;
    }

    this.set({ ...response });
  },

  login({ username, password }) {
    if (password.length) {
      return api
        .post("/api/auth/login/", { username, password })
        .done((response) => {
          this.setFromResponse(response);
        });
    }
  },

  logout() {
    this.set({ id: -1, logged_in: false });
    this.trigger("logout");
    const logout = api.post("api/auth/logout/");
    return logout;
  },

  isLoggedIn() {
    return this.get("id") !== -1;
  },

  isReady() {
    const id = this.get("id");
    return id && id !== -1;
  },
});

export const auth = new AuthModel();

const MemberModel = Model.extend({});
const MemberCollection = Collection.extend({
  model: MemberModel,

  setMembers(members) {
    members.forEach((member) => {
      this.push(new MemberModel({ ...member }));
    });
  },
});

const TagModel = Model.extend({});
const TagCollection = Collection.extend({
  model: TagModel,

  url() {
    return `/api/kanban/tags/`;
  },

  setTags(tags) {
    tags.forEach((tag) => {
      this.push(new TagModel({ ...tag }));
    });
  },

  initialize() {},
});

const CardModel = Model.extend({});
const CardCollection = Collection.extend({
  model: CardModel,
});

const LaneModel = Model.extend({
  constructor(options) {
    this.cards = new CardCollection();
    this.setCards(options.cards);
    delete options.cards;
    Model.apply(this, arguments);
  },

  url() {
    return `/api/kanban/lanes/${this.id}/`;
  },

  setCards(cards) {
    cards.forEach((card) => {
      this.cards.push({ ...card });
    });
  },

  updateLaneTitle({ title }) {
    api.patch(this.url(), {
      title: title,
    });
  },
});
const LaneCollection = Collection.extend({
  model: LaneModel,

  setLanes(lanes) {
    lanes.forEach((lane) => {
      this.push(new LaneModel({ ...lane }));
    });
  },

  createLane({ boardId, title }) {
    api
      .post(
        "/api/kanban/lanes/",
        {
          board: boardId,
          title: title,
          tasks: [],
        },
        { sendAsJSON: true }
      )
      .done((response) => {
        this.push(new LaneModel({ ...response }));
      });
  },
});

const BoardModel = Model.extend({
  defaults: { id: -1 },

  initialize() {
    this.members = new MemberCollection();
    this.tags = new TagCollection();
    this.lanes = new LaneCollection();
  },

  url() {
    return `/api/kanban/boards/${this.id}/`;
  },

  fetch() {
    return new Promise((resolve, reject) => {
      api
        .get(this.url())
        .done((response) => {
          const { id, name, owner } = response;
          this.set({ id: id, name: name, owner: owner });
          this.members.setMembers(response.members);
          this.tags.setTags(response.tags);
          this.lanes.setLanes(response.lanes);
          resolve(true);
        })
        .fail((error) => {
          console.error("Fetch board failed", error);
          reject(error);
        });
    });
  },
});

const BoardCollection = Collection.extend({
  comparator: "id",

  url() {
    return "/api/kanban/boards/";
  },
});

export const boardModel = new BoardModel();
export const boardCollection = new BoardCollection();

export default {
  auth,
  boardModel,
  boardCollection,
};
