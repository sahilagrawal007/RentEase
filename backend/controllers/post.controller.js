import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";
import prisma from "../lib/prisma.js";

// Haversine formula: returns distance (in km) between two coords
function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const toRad = (deg) => (deg * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}


export const getPosts = async (req, res) => {
  const {
    city,
    type,
    property,
    bedroom,
    minPrice,
    maxPrice,
    lat,
    lon,
    radius = "5", // default radius = 5 km
  } = req.query;

  const baseWhere = {
    type: type || undefined,
    property: property || undefined,
    bedroom: parseInt(bedroom) || undefined,
    price: {
      gte: parseInt(minPrice) || undefined,
      lte: parseInt(maxPrice) || undefined,
    },
    // Only include city if we're *not* doing a radius search:
    ...(lat && lon ? {} : { city: city || undefined }),
  };

  try {
    // 1) Fetch all posts matching baseWhere
    const posts = await prisma.post.findMany({
      where: baseWhere,
    });

    // 2) If lat/lon provided, filter by distance
    if (lat && lon) {
      const centerLat = parseFloat(lat);
      const centerLon = parseFloat(lon);
      const maxDist = parseFloat(radius);

      const nearby = posts.filter((post) => {
        const pLat = parseFloat(post.latitude);
        const pLon = parseFloat(post.longitude);
        if (isNaN(pLat) || isNaN(pLon)) return false;
        const dist = getDistanceInKm(centerLat, centerLon, pLat, pLon);
        return dist <= maxDist;
      });

      return res.status(200).json(nearby);
    }

    res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;
  
  // Validate ObjectId format
  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ message: "Invalid post ID format" });
  }

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        postDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const token = req.cookies?.token;

    if (!token) {
      return res.status(200).json({ ...post, isSaved: false });
    }

    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET_KEY);
      const saved = await prisma.savedPost.findUnique({
        where: {
          userId_postId: {
            postId: id,
            userId: payload.id,
          },
        },
      });
      return res.status(200).json({ ...post, isSaved: saved ? true : false });
    } catch (jwtError) {
      console.error("JWT verification error:", jwtError);
      // If JWT verification fails, return post without saved status
      return res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.error("Database error in getPost:", err);
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;

  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        postDetail: {
          create: body.postDetail,
        },
      },
    });
    res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to update posts" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Not Authorized!" });
    }

    await prisma.post.delete({
      where: { id },
    });

    res.status(200).json({ message: "Post deleted" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
};
