-- DropForeignKey
ALTER TABLE "FollowedCommunities" DROP CONSTRAINT "FollowedCommunities_communityId_fkey";

-- DropForeignKey
ALTER TABLE "FollowedCommunities" DROP CONSTRAINT "FollowedCommunities_userId_fkey";

-- CreateTable
CREATE TABLE "LikedPosts" (
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "likedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LikedPosts_pkey" PRIMARY KEY ("userId","postId")
);

-- CreateTable
CREATE TABLE "FavoritedPosts" (
    "userId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "favoritedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FavoritedPosts_pkey" PRIMARY KEY ("userId","postId")
);

-- AddForeignKey
ALTER TABLE "FollowedCommunities" ADD CONSTRAINT "FollowedCommunities_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowedCommunities" ADD CONSTRAINT "FollowedCommunities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedPosts" ADD CONSTRAINT "LikedPosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikedPosts" ADD CONSTRAINT "LikedPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritedPosts" ADD CONSTRAINT "FavoritedPosts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FavoritedPosts" ADD CONSTRAINT "FavoritedPosts_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Posts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
