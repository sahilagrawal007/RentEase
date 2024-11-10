import { useEffect, useRef } from "react";

function UploadWidget({ uwConfig, setState }) {
  const cloudinaryRef = useRef();
  const widgetRef = useRef();

  useEffect(() => {
    cloudinaryRef.current = window.cloudinary;
    widgetRef.current = cloudinaryRef.current.createUploadWidget(
      uwConfig,
      function (error, result) {
        if (!error && result && result.event === "success") {
          console.log("Done! Here is the image info: ", result.info);
          setState((prev) => [...prev, result.info.secure_url]);
        }
      }
    );
  }, []);

  return (
    <button
      id="upload_widget"
      className="cloudinary-button"
      onClick={() => widgetRef.current.open()}
    >
      Upload
    </button>
  );
}

export default UploadWidget;
