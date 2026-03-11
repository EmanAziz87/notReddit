import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { PostCreateMutation } from "../../types";
import postService from "../../api/postService";
import { useNavigate, useParams } from "react-router";

const CreatePostForm = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };

  const createPostMutation = useMutation({
    mutationFn: async (postCreateObj: PostCreateMutation) =>
      await postService.createPost(
        postCreateObj.communityId,
        postCreateObj.fileUploadData,
      ),

    onError: () => {
      console.error("there was an error creating a post");
    },
    onSettled: () => {
      // invalidate the communityPosts query and navigate to community home feed.
      // you first have to make the query to grab all communities from the home feed
      // when fetched community posts, create post card component (large - compact later)
      // and use that for rendering post for both community page and home feed.
      queryClient.invalidateQueries();
    },
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = e.target["post-content-input"].value;
    const content = e.target["post-title-input"].value;
    const fileArray = Array.from(
      e.target["post-media-upload-input"].files || [],
    ) as File[];
    const fileUploads = new FormData();
    fileArray.forEach((file) => fileUploads.append("postImages", file));

    createPostMutation.mutate({
      title,
      content,
      fileUploadData: fileUploads,
      communityId: communityId!,
    });
  };

  return (
    <div>
      <h3>Create your post</h3>
      <form onSubmit={(e) => handleSubmit(e)} encType="multipart/form-data">
        <div>
          <label htmlFor="post-title-input">Title: </label>
          <input type="text" id="post-title-input" />
        </div>
        <div>
          <label htmlFor="post-content-input">Content: </label>
          <textarea
            name="post-content-input"
            id="post-content-input"
            style={{ width: "400px", height: "200px" }}
          />
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          {previews.map((url: string, i: number) => (
            <img
              key={i}
              src={url}
              style={{ width: 80, height: 80, objectFit: "cover" }}
            />
          ))}
        </div>
        <div>
          <label htmlFor="post-media-upload-input">Images: </label>
          <input
            id="post-media-upload-input"
            type="file"
            name="post-media-upload-input"
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
        <button type="submit">Create</button>
      </form>
    </div>
  );
};

export default CreatePostForm;
