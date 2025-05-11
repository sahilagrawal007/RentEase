import { defer } from "react-router-dom";
import apiRequest from "./apiRequest";
import { toast } from "react-toastify";

export const singlePageLoader = async ({ request, params }) => {
  const res = await apiRequest("/posts/" + params.id);
  return res.data;
};

async function geocodeCity(city) {
  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", city);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "1"); // only need the first hit
  url.searchParams.set("addressdetails", "0"); // optional
  const res = await fetch(url.toString(), {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
    },
  });
  if (!res.ok) throw new Error("Geocoding failed: " + res.statusText);
  return await res.json();
}

export const listPageLoader = async ({ request }) => {
  const url = new URL(request.url);
  const params = url.searchParams;

  // 1) Collect all the “other” filters
  const extraParams = new URLSearchParams();
  for (const key of ["type", "property", "bedroom", "minPrice", "maxPrice"]) {
    const v = params.get(key);
    if (v && v.trim() !== "") {
      extraParams.set(key, v);
    }
  }

  let finalParams = new URLSearchParams();

  // 2) If the user entered a city, try geocoding
  if (params.has("city") && params.get("city")?.trim()) {
    try {
      const city = params.get("city").trim();
      const hits = await geocodeCity(city); 

      if (hits.length > 0) {
        const { lat, lon } = hits[0];

        // radius search: lat, lon, radius + other filters
        finalParams.set("lat", lat);
        finalParams.set("lon", lon);
        finalParams.set("radius", "5");            // 5 km radius
        // spread in the rest
        extraParams.forEach((val, key) => finalParams.set(key, val));

      } else {
        // no geocode result → fall back to city + others
        finalParams = new URLSearchParams(params.toString());
      }
    } catch (e) {
      console.error("Geocode error:", e);
      toast.error(`Openstreet API error: ${e}`);
      // fallback
      finalParams = new URLSearchParams(params.toString());
    }
  } else {
    // 3) no city filter → pass everything through
    finalParams = new URLSearchParams(params.toString());
  }

  // 4) Build the API endpoint
  const apiEndpoint = `/posts?${finalParams.toString()}`;

  // Example: "/posts?lat=22.3072&lon=73.1812&radius=5&type=rent&bedroom=2"
  // or       "/posts?city=Vadodara&type=sale&minPrice=1000"

  const postPromise = apiRequest(apiEndpoint);
  return defer({ postResponse: postPromise });
};

export const profilePageLoader = async () => {
  const postPromise = apiRequest("/users/profilePosts");
  const chatPromise = apiRequest("/chats");
  return defer({
    postResponse: postPromise,
    chatResponse: chatPromise,
  });
};
