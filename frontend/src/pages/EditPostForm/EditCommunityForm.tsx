import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useGetCommunity } from "../../hooks/useGetCommunity";
import styles from "./EditCommunityForm.module.css";
import communityService from "../../api/communityService";

const EditCommunityForm = () => {
  const { communityId } = useParams();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { communityData, communityError } = useGetCommunity(communityId!);

  const [communityDescription, setCommunityDescription] = useState<string>(
    communityData?.description ?? "",
  );
  const [communityIsPublic, setCommunityIsPublic] = useState<boolean>(
    communityData?.public ?? false,
  );

  const [profileImagePreview, setProfileImagePreview] = useState<string[]>([
    communityData?.profileImageUrl ?? "",
  ]);

  const [bannerImagePreview, setBannerImagePreview] = useState<string[]>([
    communityData?.bannerImageUrl ?? "",
  ]);

  useEffect(() => {
    if (communityData?.description && communityData?.public) {
      setCommunityDescription(communityData.description);
      setCommunityIsPublic(communityData.public);
      setProfileImagePreview([communityData.profileImageUrl]);
      setBannerImagePreview([communityData.bannerImageUrl]);
    }
  }, [communityData]);

  const editCommunityMutation = useMutation({
    mutationFn: async (formData: FormData) =>
      await communityService.editCommunity(communityId!, formData),
    onError: () => console.error("error editing community"),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["community", communityId] });
      navigate(`/community/${communityId}`);
    },
  });

  const handleProfileImageFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setProfileImagePreview(urls);
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setBannerImagePreview(urls);
  };

  // fetch community info and populate form fields. files are checked with zod so you can choose
  // not to send them if you dont want to change the profile/banner. delete the old replace file
  // from s3. i dont think the code for deletion is written in the backend service for editing communities.

  const handleEditCommunity = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData();

    const bannerFileUpload = e.target["communityBannerImage"].files![0];
    const profileFileUpload = e.target["communityProfileImage"].files![0];

    if (bannerFileUpload) {
      formData.append(
        "communityBannerImage",
        e.target["communityBannerImage"].files![0],
      );
    }

    if (profileFileUpload) {
      formData.append(
        "communityProfileImage",
        e.target["communityProfileImage"].files![0],
      );
    }

    formData.append(
      "description",
      e.target["edit-community-description-input"].value,
    );
    formData.append(
      "public",
      e.target["edit-community-ispublic-input"].checked,
    );

    editCommunityMutation.mutate(formData);
  };

  if (!communityData) return null;
  if (communityError) {
    return <div>Community Fetch Error: {communityError.message}</div>;
  }

  return (
    <div>
      <form onSubmit={handleEditCommunity}>
        <div>
          <label htmlFor="edit-community-description-input">Description:</label>
          <textarea
            id="edit-community-description-input"
            name="edit-community-description-input"
            value={communityDescription}
            onChange={(e) => setCommunityDescription(e.currentTarget.value)}
          />
        </div>
        <div>
          <label htmlFor="edit-community-ispublic-input">Public: </label>
          <input
            type="checkbox"
            id="edit-community-ispublic-input"
            name="edit-community-ispublic-input"
            checked={communityIsPublic}
            onChange={(e) => setCommunityIsPublic(e.currentTarget.checked)}
          />
        </div>
        <div>
          <label htmlFor="edit-community-profile-image-input">
            Profile Image:
          </label>
          <input
            type="file"
            accept="image/*"
            name="communityProfileImage"
            onChange={(e) => handleProfileImageFileChange(e)}
          />
        </div>
        {profileImagePreview.map((imgUrl) => {
          return (
            <div key={imgUrl}>
              <img
                src={imgUrl || undefined}
                alt="profile image"
                className={styles["profile-pic-preview-image"]}
              />
            </div>
          );
        })}
        <div>
          <label htmlFor="edit-community-banner-image-input">
            Banner Image:
          </label>
          <input
            type="file"
            accept="image/*"
            id="edit-community-banner-image-input"
            name="communityBannerImage"
            onChange={(e) => handleBannerFileChange(e)}
          />
        </div>
        {bannerImagePreview.map((imgUrl) => {
          return (
            <div key={imgUrl}>
              <img
                src={imgUrl || undefined}
                alt="banner image"
                className={styles["banner-preview-image"]}
              />
            </div>
          );
        })}
        <button type="submit">Confirm Edit</button>
      </form>
    </div>
  );
};

export default EditCommunityForm;
