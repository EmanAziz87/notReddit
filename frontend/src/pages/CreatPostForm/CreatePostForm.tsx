import { useState } from "react";

const CreatePostForm = () => {
  const [previews, setPreviews] = useState<string[]>([]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setPreviews(urls);
  };
  return (
    <div>
      <h3>Create your post</h3>
      <form encType="multipart/form-data">
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
            multiple
            accept="image/*"
            onChange={handleFileChange}
          />
        </div>
      </form>
    </div>
  );
};

export default CreatePostForm;
