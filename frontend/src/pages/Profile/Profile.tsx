import { useMutation, useQuery } from "@tanstack/react-query";
import commentService from "../../api/commentService";
import type { LikedCommentWithRelations } from "backend";

const Profile = () => {
  const {
    data: likedCommentsData,
    isLoading: likedCommentsLoading,
    error: likedCommentsError,
  } = useQuery<LikedCommentWithRelations[]>({
    queryFn: commentService.getLikedComments,
    queryKey: ["likedComments"],
  });

  if (likedCommentsLoading) {
    return <div>Loading...</div>;
  }
  if (likedCommentsError) {
    return (
      <div>Error fetching liked comments: {likedCommentsError.message}</div>
    );
  }

  if (!likedCommentsData) return null;
  console.log(JSON.stringify(likedCommentsData));
  return (
    <div>
      <div>
        <h3>Liked Comments</h3>
        <ul>
          {likedCommentsData.map((likeData) => {
            return (
              <div
                key={likeData.commentId}
                style={{ border: "1px solid black" }}
              >
                <div>{likeData.comment.author.username}</div>
                <div>{likeData.comment.content}</div>
              </div>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
