import prisma from "../lib/prisma";
import { hashing } from "./hashing";
import { saltRounds } from "./saltRounds";

const seedDB = async () => {
  await prisma.session.deleteMany();
  await prisma.postReaction.deleteMany();
  await prisma.followedCommunities.deleteMany();
  await prisma.favoritedPosts.deleteMany();
  await prisma.comments.deleteMany();
  await prisma.posts.deleteMany();
  await prisma.communities.deleteMany();
  await prisma.users.deleteMany();

  const hashedPassword = await hashing("strongPass1", saltRounds);

  const user = await prisma.users.create({
    data: {
      username: "emanUser",
      passwordHash: hashedPassword,
      email: "hello@gmail.com",
      birthdate: new Date("1995-06-15"),
    },
  });

  const communities = await prisma.communities.createManyAndReturn({
    data: [
      {
        name: "medecine",
        description: "community for doctors and med students",
        public: true,
        creatorId: user.id,
      },
      {
        name: "learnProgramming",
        description: "a place to learn how to code",
        public: true,
        creatorId: user.id,
      },
      {
        name: "boxing",
        description: "amateur boxing questions and vids",
        public: true,
        creatorId: user.id,
      },
    ],
  });

  await prisma.posts.createMany({
    data: [
      {
        title: "what computer to buy",
        content: "looking to code what to buy",
        mediaUrl: [
          "https://image-bucket-social-eman.s3.us-east-2.amazonaws.com/daily-fear-as-a-med-student-v0-t4lbha3e3ygg1.jpg",
        ],
        communityId: communities[0]!.id,
        authorId: user.id,
      },
      {
        title: "thoughts",
        content: "any one else",
        mediaUrl: [
          "https://image-bucket-social-eman.s3.us-east-2.amazonaws.com/1770417632197-667351375.jpeg",
        ],
        communityId: communities[1]!.id,
        authorId: user.id,
      },
      {
        title: "not boxing related",
        content: "pixel art",
        mediaUrl: [
          "https://image-bucket-social-eman.s3.us-east-2.amazonaws.com/1770402134293-960020110.png",
        ],
        communityId: communities[2]!.id,
        authorId: user.id,
      },
    ],
  });

  const followedCommunities = await prisma.followedCommunities.createMany({
    data: [
      {
        userId: user.id,
        communityId: communities[0]!.id,
      },
      {
        userId: user.id,
        communityId: communities[1]!.id,
      },
      {
        userId: user.id,
        communityId: communities[2]!.id,
      },
    ],
  });

  await prisma.users.update({
    where: {
      id: user.id,
    },
    data: {
      followingCount: followedCommunities.count,
    },
  });
};

seedDB()
  .catch(console.error)
  .finally(() => {
    prisma.$disconnect();
  });
