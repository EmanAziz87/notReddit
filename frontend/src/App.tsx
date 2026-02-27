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
import Profile from "./pages/Profile";

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error: any) => {
      if (error?.status === 401) {
        //add some error conditions for api calls
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error: any) => {
      if (error?.status === 401) {
        queryClient.setQueryData(["me"], null);
        window.location.href = "/login";
      }
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
        </Route>
        <Route path="login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
