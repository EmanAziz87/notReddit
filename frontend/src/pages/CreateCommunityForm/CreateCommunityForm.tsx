import { useState } from "react";
import styles from "./CreateCommunityForm.module.css";

const CreateCommunityForm = () => {
  const [bannerPreview, setBannerPreview] = useState<string[]>([]);
  const [profilePicPreview, setProfilePicPreview] = useState<string[]>([]);

  const handleProfilePicFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setProfilePicPreview(urls);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setBannerPreview(urls);
  };

  const handleCreateCommunity = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append(
      "communityProfileImage",
      e.target["communityProfileImage"].files[0],
    );
    formData.append(
      "communityBannerImage",
      e.target["communityBannerImage"].files[0],
    );
    formData.append("name", e.target["name-input"].value);
    formData.append("description", e.target["description-input"].value);
    formData.append("public", e.target["public-private-checkbox-input"].value);
  };

  return (
    <div>
      <h3>Create Community</h3>
      <form onSubmit={handleCreateCommunity}>
        <div>
          <label htmlFor="name-input">Name: </label>
          <input type="text" name="name-input" id="name-input" required />
        </div>
        <div>
          <label htmlFor="description-input">Description: </label>
          <textarea name="description-input" id="description-input" required />
        </div>
        <div>
          <label htmlFor="public-private-checkbox-input">Public</label>
          <input
            type="checkbox"
            name="public-private-checkbox-input"
            id="public-private-checkbox-input"
            required
          />
        </div>
        <div>
          <label htmlFor="community-profile-image-file-upload">
            Profile Image:{" "}
          </label>
          <input
            type="file"
            name="communityProfileImage"
            id="community-profile-image-file-upload"
            onChange={handleProfilePicFileChange}
            required
          />
        </div>
        {profilePicPreview.map((imgURl) => {
          return (
            <div>
              <img
                src={imgURl}
                alt=""
                className={styles["profile-pic-preview-image"]}
              />
            </div>
          );
        })}
        <div>
          <label htmlFor="banner-image-file-upload">Banner Image: </label>
          <input
            type="file"
            name="communityBannerImage"
            id="banner-image-file-upload"
            onChange={handleBannerFileChange}
            required
          />
        </div>
        {bannerPreview.map((imgUrl) => {
          console.log("banner url", imgUrl);
          return (
            <div>
              <img
                src={imgUrl}
                alt=""
                className={styles["banner-preview-image"]}
              />
            </div>
          );
        })}
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreateCommunityForm;
