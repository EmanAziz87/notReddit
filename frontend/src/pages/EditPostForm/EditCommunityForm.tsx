import { useMutation } from "@tanstack/react-query";
import { useParams } from "react-router";

const EditCommunityForm = () => {
  const { commentId } = useParams();

  const editCommunityMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      if (formData.get("communityProfileImage")) {
        return;
      }

      if (formData.get("communityBannerImage")) {
        return;
      }
    },
  });

  // fetch community info and populate form fields. files are checked with zod so you can choose
  // not to send them if you dont want to change the profile/banner. delete the old replace file
  // from s3. i dont think the code for deletion is written in the backend service for editing communities.

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    formData.append("communityProfileImage", e.currentTarget.files![0]);

    console.log(formData.get("communityProfileImage"));
  };

  const handleBannerFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formData = new FormData();
    formData.append("communityBannerImage", e.currentTarget.files![0]);
  };
  return <div></div>;
};

export default EditCommunityForm;
