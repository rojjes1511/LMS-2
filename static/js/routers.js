import home from "./components/home.js";
import Login from "./components/login.js";
import CreateUser from "./components/register.js";
import librariandasboard from "./components/librariandashboard.js";
import book from "./components/book.js";
import mybooks from "./components/mybooks.js";
import requests from "./components/requests.js";
import userstats from "./components/userstats.js";
import adminstats from "./components/adminstats.js";
import userstatus from "./components/u_status.js";
import librarianstatus from "./components/l_status.js";

const routes = [
  {
    path: "/",
    name: "home",
    component: home,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/register",
    name: "register",
    component: CreateUser,
  },
  {
    path: "/librarian",
    name: "librariandashboard",
    component: librariandasboard,
  },
  {
    path: "/book/:sectionid",
    name: "book",
    component: book,
  },
  {
    path: "/mybooks",
    name: "mybooks",
    component: mybooks,
  },
  {
    path: "/requests",
    name: "requests",
    component: requests,
  },
  {
    path: "/userstats",
    name: "userstats",
    component: userstats,
  },
  {
    path: "/u_status",
    name: "userstatus",
    component: userstatus,
  },
  {
    path: "/l_status",
    name: "librarianstatus",
    component: librarianstatus,
  },
  {
    path: "/adminstats",
    name: "adminstats",
    component: adminstats,
  },

  {
    path: "*",
    redirect: "/",
  },
];

const router = new VueRouter({
  routes,
});

export default router;
