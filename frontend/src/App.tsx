import { BrowserRouter, Route, Routes } from "react-router";
import RootLayout from "./layouts/RootLayout/RootLayout";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import HomeFeed from "./pages/HomeFeed";
import PostDetails from "./pages/PostDetails";
import Login from "./pages/Login";
import userService from "./api/userService";
import Profile from "./pages/Profile/Profile";
import Community from "./pages/Community/Community";
import CreatePostForm from "./pages/CreatPostForm/CreatePostForm";
import CreateCommunityForm from "./pages/CreateCommunityForm/CreateCommunityForm";
import EditCommunityForm from "./pages/EditPostForm/EditCommunityForm";
import Register from "./pages/Register/Register";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (error?.status === 401) {
      }

      console.error("General Error Log (query Global): ", error);
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      if (error?.status === 401) {
        queryClient.setQueryData(["me"], null);
        window.location.href = "/login";
      }
      console.error("General Error Log (mutation Global): ", error);
    },
  }),
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

function AppContent() {
  const { data: user } = useQuery({
    queryKey: ["me"],
    queryFn: userService.fetchMe,
  });

  console.log("fetched user: ", user);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootLayout />}>
          <Route index element={<HomeFeed />} />
          <Route path="post/:communityId/:postId" element={<PostDetails />} />
          <Route path="profile/:profileId" element={<Profile />} />
          <Route path="community/:communityId/" element={<Community />} />
          <Route
            path="community/:communityId/createPost"
            element={<CreatePostForm />}
          />
          <Route
            path="community/:communityId/editCommunity"
            element={<EditCommunityForm />}
          />
          <Route
            path="community/createCommunity"
            element={<CreateCommunityForm />}
          />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
