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

  return (
    <div>
      <h3>Create Community</h3>
      <form>
        <div>
          <label htmlFor="name-input">Name: </label>
          <input type="text" name="name-input" id="name-input" />
        </div>
        <div>
          <label htmlFor="description-input">Description: </label>
          <textarea name="description-input" id="description-input" />
        </div>
        <div>
          <label htmlFor="public-private-checkbox-input">Public</label>
          <input
            type="checkbox"
            name="public-private-checkbox-input"
            id="public-private-checkbox-input"
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
        <button>Create</button>
      </form>
    </div>
  );
};

export default CreateCommunityForm;
