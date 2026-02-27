import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router";
import userService from "../../api/userService";

const Login = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      return await userService.login(credentials);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["me"], data.user);
      navigate("/");
    },
    onError: (error) => {
      console.error("Login failed: ", error);
    },
  });

  const handleLogin = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginMutation.mutate({ username, password });
    setUsername("");
    setPassword("");
  };

  return (
    <div>
      Login form
      <form onSubmit={(e) => handleLogin(e)}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            type="text"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Log in</button>
      </form>
      <NavLink to="/">Nevermind, just browsing</NavLink>
    </div>
  );
};

export default Login;
