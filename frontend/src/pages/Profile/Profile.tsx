import { useQuery } from "@tanstack/react-query";
import commentService from "../../api/commentService";
import type {
  LikedCommentWithRelations,
  LikedPostWithRelations,
} from "backend";
import postService from "../../api/postService";

const Profile = () => {
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

  if (likedCommentsLoading && likedPostsLoading) {
    return <div>Loading...</div>;
  }
  if (likedCommentsError || likedPostsError) {
    return (
      <div>
        Error fetching liked comments: {likedCommentsError?.message} | Error
        fetching liked posts: {likedPostsError?.message}
      </div>
    );
  }

  return (
    <div>
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
    </div>
  );
};

export default Profile;
