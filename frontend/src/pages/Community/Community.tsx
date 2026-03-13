import { useQuery } from "@tanstack/react-query";
import { NavLink, useParams } from "react-router";
import communityService from "../../api/communityService";
import type { Communities } from "backend/generated/prisma/client";
import type { PostsWithRelationsNoComments } from "backend";
import postService from "../../api/postService";
import PostCard from "../../components/PostCard";
import styles from "./Community.module.css";
import { useState } from "react";

const Community = () => {
  const [revealEdit, setRevealEdit] = useState<boolean>(false);
  const { communityId } = useParams();

  const {
    data: communityData,
    isLoading: communityLoading,
    error: communityError,
  } = useQuery<Communities>({
    queryKey: ["community", communityId],
    queryFn: async () => await communityService.fetchCommunity(communityId!),
  });

  const {
    data: communityPostsData,
    isLoading: communityPostsLoading,
    error: communityPostsError,
  } = useQuery<PostsWithRelationsNoComments[]>({
    queryKey: ["communityPosts", communityId],
    queryFn: async () => await postService.fetchCommunityPosts(communityId!),
  });

  if (communityLoading && communityPostsLoading) return <div>Loading...</div>;
  if (communityError && communityPostsError)
    return <div>Post Error: {communityError.message}</div>;
  if (!communityData || !communityPostsData) return null;

  return (
    <div>
      <div>
        <img
          src={communityData.bannerImageUrl || undefined}
          className={styles["community-banner-image"]}
          alt=""
        />
      </div>
      <div className={styles["community-name-profile-pic-container"]}>
        <div>
          <label>
            <img
              src={communityData.profileImageUrl || undefined}
              className={styles["community-profile-image"]}
              alt="profile-image"
            />
            <div className={styles["edit-profile-pic-overlay"]}>
              <span>Edit</span>
            </div>
            <input type="file" className={styles["edit-profile-pic-input"]} />
          </label>
        </div>
        <h2>{communityData.name}</h2>
      </div>
      <div>{communityData.description}</div>
      <div>Followers: {communityData.followers}</div>
      <NavLink to={`/community/${communityId}/createPost`}>Create post</NavLink>
      <br />
      <div>
        {communityPostsData.map((post) => (
          <NavLink key={post.id} to={`/post/${communityId}/${post.id}`}>
            <PostCard post={post} />
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Community;
