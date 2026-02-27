-- DropForeignKey
ALTER TABLE "FollowedCommunities" DROP CONSTRAINT "FollowedCommunities_communityId_fkey";

-- DropForeignKey
ALTER TABLE "FollowedCommunities" DROP CONSTRAINT "FollowedCommunities_userId_fkey";

-- AddForeignKey
ALTER TABLE "FollowedCommunities" ADD CONSTRAINT "FollowedCommunities_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Communities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowedCommunities" ADD CONSTRAINT "FollowedCommunities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
