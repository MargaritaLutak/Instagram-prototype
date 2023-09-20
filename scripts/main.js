import { initListenersAddPostFile } from "./addPost.js";
import { getPostsFromServer, initListenersShowPostFile } from "./showPosts.js";
import { initListenersPostInterectionFile } from "./postInterection.js";
import { templateCurrentBio, initListenersEditBioFile } from "./editBio.js";

initListenersAddPostFile();
initListenersShowPostFile();
getPostsFromServer();
initListenersPostInterectionFile();
templateCurrentBio();
initListenersEditBioFile();