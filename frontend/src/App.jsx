import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { listPageLoader, profilePageLoader, singlePageLoader } from "./lib/loaders";
import About from "./routes/aboutPage/aboutPage";
import ContactPage from "./routes/contactPage/contactPage";
import HomePage from "./routes/homePage/homePage";
import { Layout, RequireAuth } from "./routes/layout/layout";
import ListPage from "./routes/listPage/listPage";
import Login from "./routes/login/login";
import MessagesPage from "./routes/MessagesPage/MessagesPage";
import NewPostPage from "./routes/newPostPage/newPostPage";
import ProfilePage from "./routes/profilePage/profilePage";
import ProfileUpdatePage from "./routes/profileUpdatePage/profileUpdatePage";
import Register from "./routes/register/register";
import SinglePage from "./routes/singlePage/singlePage";

function App() {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Layout />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/",
          element: <HomePage />,
        },
        {
          path: "/list",
          element: <ListPage />,
          loader: listPageLoader,
          errorElement: <ErrorBoundary />,
        },
        {
          path: "/post/:id",
          element: <SinglePage />,
          loader: singlePageLoader,
          errorElement: <ErrorBoundary />,
        },
        {
          path: "/login",
          element: <Login />,
        },
        {
          path: "/register",
          element: <Register />,
        },
        {
          path: "/about",
          element: <About />,
        },
        {
          path: "/contact",
          element: <ContactPage />,
        },
      ],
    },
    {
      path: "/",
      element: <RequireAuth />,
      errorElement: <ErrorBoundary />,
      children: [
        {
          path: "/profile",
          element: <ProfilePage />,
          loader: profilePageLoader,
          errorElement: <ErrorBoundary />,
        },
        {
          path: "/profile/update",
          element: <ProfileUpdatePage />,
        },
        {
          path: "/add",
          element: <NewPostPage />,
        },
        {
          path: "/messages",
          element: <MessagesPage />,
          errorElement: <ErrorBoundary />,
        }
      ],
    },
  ]);

  return <RouterProvider router={router} />;
}

export default App;
