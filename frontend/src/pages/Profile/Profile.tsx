import { useQuery, useQueryClient } from "@tanstack/react-query";
import commentService from "../../api/commentService";
import type {
  FavoritedPostWithRelations,
  LikedCommentWithRelations,
  LikedPostWithRelations,
  UserSession,
} from "backend";
import postService from "../../api/postService";
import styles from "./Profile.module.css";

const Profile = () => {
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserSession>(["me"]);
  const {
    data: likedCommentsData,
    isLoading: likedCommentsLoading,
    error: likedCommentsError,
  } = useQuery<LikedCommentWithRelations[]>({
    queryFn: commentService.getLikedComments,
    queryKey: ["likedComments"],
  });

  const {
    data: likedPostsData,
    isLoading: likedPostsLoading,
    error: likedPostsError,
  } = useQuery<LikedPostWithRelations[]>({
    queryFn: postService.getLikedPosts,
    queryKey: ["likedPosts"],
  });

  const {
    data: favoritedPostsData,
    isLoading: favoritedPostsLoading,
    error: favoritedPostsError,
  } = useQuery<FavoritedPostWithRelations[]>({
    queryFn: postService.getFavoritedPosts,
    queryKey: ["favoritedPosts"],
  });

  if (likedCommentsLoading && likedPostsLoading && favoritedPostsLoading) {
    return <div>Loading...</div>;
  } else {
    console.log("date: ");
  }
  if (likedCommentsError || likedPostsError || favoritedPostsError) {
    return (
      <div>
        Error fetching liked comments: {likedCommentsError?.message} | Error
        fetching liked posts: {likedPostsError?.message} | Error fetching
        favorited posts: {favoritedPostsError?.message}
      </div>
    );
  }

  return (
    <div>
      <br />
      <div style={{ border: "1px solid black" }}>
        <h2>{currentUser?.username}</h2>
        <div>
          <img
            src={`${currentUser?.profileImageUrl}`}
            alt="Profile Image"
            className={styles["profile-pic-image"]}
          />
        </div>
        <div>Email: {currentUser?.email}</div>
        <div>Birthdate: {new Date(currentUser?.birthdate!).toDateString()}</div>
      </div>
      <br />
      <div>
        <h3>Liked Comments</h3>
        <ul>
          {likedCommentsData ? (
            likedCommentsData.map((likeData) => {
              return (
                <div
                  key={likeData.commentId}
                  style={{ border: "1px solid black" }}
                >
                  <div>{likeData.comment.author.username}</div>
                  <div>{likeData.comment.content}</div>
                </div>
              );
            })
          ) : (
            <div>No Liked Comments</div>
          )}
        </ul>
      </div>
      <div>
        <h3>Liked Posts</h3>
        <ul>
          {likedPostsData ? (
            likedPostsData.map((likeData) => {
              return (
                <div
                  key={likeData.postId}
                  style={{ border: "1px solid black" }}
                >
                  <img
                    src={`${likeData.post.mediaUrl[0]}`}
                    alt="Post Image"
                    width={100}
                    height={100}
                  />
                  <div>{likeData.post.author.username}</div>
                  <div>{likeData.post.content}</div>
                </div>
              );
            })
          ) : (
            <div>No Liked Posts</div>
          )}
        </ul>
      </div>
      <div>
        <h3>Favorited Posts</h3>
        <ul>
          {favoritedPostsData && favoritedPostsData.length > 0 ? (
            favoritedPostsData.map((favoritedData) => {
              return (
                <div
                  key={favoritedData.postId}
                  style={{ border: "1px solid black" }}
                >
                  <img
                    src={`${favoritedData.post.mediaUrl[0]}`}
                    alt="Post Image"
                    width={100}
                    height={100}
                  />
                  <div>{favoritedData.post.author.username}</div>
                  <div>{favoritedData.post.content}</div>
                </div>
              );
            })
          ) : (
            <div>No Favorited Posts</div>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
