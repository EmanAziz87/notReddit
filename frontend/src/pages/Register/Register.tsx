import { useState } from "react";
import styles from "./Register.module.css";
import { useMutation } from "@tanstack/react-query";
import userService from "../../api/userService";
import { useNavigate } from "react-router";

const Register = () => {
  const [profileImagePreview, setProfileImagePreview] = useState<string>("");

  const navigate = useNavigate();

  const registerUserMutation = useMutation({
    mutationFn: async (formData: FormData) => userService.register(formData),
    onError: () => {
      console.error("error registering user");
    },
    onSuccess: () => {
      navigate("/");
    },
  });

  const handleRegisterSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("birthdate", e.target["register-birthdate-input"].value);
    formData.append("email", e.target["register-email-input"].value);
    formData.append("username", e.target["register-username-input"].value);
    formData.append("password", e.target["register-password-input"].value);
    formData.append(
      "profileImage",
      e.target["register-profile-pic-input"].files[0],
    );

    registerUserMutation.mutate(formData);
  };

  const handleProfileImagePreview = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const profileImageFile = e.target.files![0];
    setProfileImagePreview(URL.createObjectURL(profileImageFile));
  };

  return (
    <div>
      <h3>Register Here</h3>
      <form onSubmit={(e) => handleRegisterSubmit(e)}>
        <div>
          <label htmlFor="register-username-input">Username: </label>
          <input
            type="text"
            id="register-username-input"
            name="register-username-input"
          />
        </div>
        <div>
          <label htmlFor="register-password-input">Password: </label>
          <input
            type="text"
            id="register-password-input"
            name="register-password-input"
          />
        </div>
        <div>
          <label htmlFor="register-profile-pic-input">Profile Picture: </label>
          <input
            type="file"
            onChange={(e) => handleProfileImagePreview(e)}
            id="register-profile-pic-input"
            name="register-profile-pic-input"
          />
          <img
            src={profileImagePreview}
            alt=""
            className={styles["profile-pic-preview-image"]}
          />
        </div>
        <div>
          <label htmlFor="register-email-input">Email: </label>
          <input
            type="email"
            id="register-email-input"
            name="register-email-input"
          />
        </div>
        <div>
          <label htmlFor="register-birthdate-input">Birthdate: </label>
          <input
            type="date"
            id="register-birthdate-input"
            name="register-birthdate-input"
          />
        </div>
        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default Register;
