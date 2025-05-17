import { defer } from "react-router-dom";
import { toast } from "react-toastify";
import apiRequest from "./apiRequest";

export const singlePageLoader = async ({ request, params }) => {
  try {
    const res = await apiRequest.get("/posts/" + params.id);
    
    if (!res.data) {
      throw new Error("Post not found");
    }

    // Log the post data to verify user structure
    console.log("Post data:", {
      id: res.data.id,
      userId: res.data.userId,
      user: res.data.user
    });
    
    return res.data;
  } catch (error) {
    console.error("Error loading post:", error);
    
    // Handle specific error cases
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 400:
          throw new Error("Invalid post ID format");
        case 404:
          throw new Error("Post not found");
        case 500:
          throw new Error("Server error while loading post");
        default:
          throw new Error(message || "Failed to load post");
      }
    }
    
    // Handle network errors
    if (error.message === "Network Error") {
      throw new Error("Unable to connect to the server. Please check your internet connection.");
    }
    
    throw new Error(error.message || "Failed to load post");
  }
};

async function geocodeCity(city) {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("q", city);
    url.searchParams.set("format", "json");
    url.searchParams.set("limit", "1");
    url.searchParams.set("addressdetails", "0");
    
    const res = await fetch(url.toString(), {
      headers: {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
      },
    });
    
    if (!res.ok) throw new Error("Geocoding failed: " + res.statusText);
    return await res.json();
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error("Failed to geocode city");
  }
}

export const listPageLoader = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const params = url.searchParams;

    const extraParams = new URLSearchParams();
    for (const key of ["type", "property", "bedroom", "minPrice", "maxPrice"]) {
      const v = params.get(key);
      if (v && v.trim() !== "") {
        extraParams.set(key, v);
      }
    }

    let finalParams = new URLSearchParams();

    if (params.has("city") && params.get("city")?.trim()) {
      try {
        const city = params.get("city").trim();
        const hits = await geocodeCity(city);

        if (hits.length > 0) {
          const { lat, lon } = hits[0];
          finalParams.set("lat", lat);
          finalParams.set("lon", lon);
          finalParams.set("radius", "5");
          extraParams.forEach((val, key) => finalParams.set(key, val));
        } else {
          finalParams = new URLSearchParams(params.toString());
        }
      } catch (e) {
        console.error("Geocode error:", e);
        toast.error(`Openstreet API error: ${e}`);
        finalParams = new URLSearchParams(params.toString());
      }
    } else {
      finalParams = new URLSearchParams(params.toString());
    }

    const apiEndpoint = `/posts?${finalParams.toString()}`;
    const postPromise = apiRequest.get(apiEndpoint);
    return defer({ postResponse: postPromise });
  } catch (error) {
    console.error("Error loading posts:", error);
    throw new Error(error.message || "Failed to load posts");
  }
};

export const profilePageLoader = async () => {
  try {
    const postPromise = apiRequest.get("/users/profilePosts");
    const chatPromise = apiRequest.get("/chats");
    return defer({
      postResponse: postPromise,
      chatResponse: chatPromise,
    });
  } catch (error) {
    console.error("Error loading profile:", error);
    throw new Error(error.message || "Failed to load profile");
  }
};
