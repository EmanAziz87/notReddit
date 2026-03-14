import { NavLink, useNavigate, useParams } from "react-router";
import PostCard from "../../components/PostCard";
import styles from "./Community.module.css";
import { useGetMe } from "../../hooks/useGetMe";
import { useGetCommunity } from "../../hooks/useGetCommunity";
import { useGetCommunityPosts } from "../../hooks/useGetCommunityPosts";

const Community = () => {
  const { communityId } = useParams();
  const navigate = useNavigate();

  if (!communityId) return null;

  const { user, userIsLoading } = useGetMe();
  const { communityData, communityLoading, communityError } =
    useGetCommunity(communityId);

  const { communityPostsData, communityPostsLoading, communityPostsError } =
    useGetCommunityPosts(communityId);

  const handleNavigateEdit = () =>
    navigate(`/community/${communityId}/editCommunity`);

  if (communityLoading && communityPostsLoading && userIsLoading)
    return <div>Loading...</div>;
  if (communityError && communityPostsError)
    return <div>Post Error: {communityError.message}</div>;
  if (!communityData || !communityPostsData) return null;

  return (
    <div>
      <div>
        <img
          src={communityData.bannerImageUrl || undefined}
          className={styles["community-banner-image"]}
          alt="banner-image"
        />
      </div>
      <div>
        <img
          src={communityData.profileImageUrl || undefined}
          className={styles["community-profile-image"]}
          alt="profile-image"
        />
        <h2>{communityData.name}</h2>
        {user?.id === communityData.creatorId && (
          <button onClick={handleNavigateEdit}>Edit Community</button>
        )}
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
