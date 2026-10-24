import { useEffect, useState } from "react";
import { ImagePlus } from "lucide-react";

const MAX_BYTES = 1024 * 1024;
const TYPES = ["image/png", "image/jpeg", "image/jpg"];

// File picker with preview. Mirrors backend/middlewares/multer.js limits (png/jpg, max 1MB).
function ImageInput({ id, label, currentUrl, onChange, onError, required, aspect = "aspect-[4/3]" }) {
  const [preview, setPreview] = useState("");

  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview]);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!TYPES.includes(file.type)) {
      e.target.value = "";
      return onError?.("Only .png, .jpg and .jpeg images are allowed");
    }
    if (file.size > MAX_BYTES) {
      e.target.value = "";
      return onError?.("Image must be 1MB or smaller");
    }
    onError?.("");
    setPreview(URL.createObjectURL(file));
    onChange(file);
  };

  const shown = preview || currentUrl;

  return (
    <div>
      <span className="label">
        {label} {required && <span className="text-red-500">*</span>}
      </span>
      <label
        htmlFor={id}
        className={`relative flex ${aspect} w-full cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:border-brand-500`}
      >
        {shown ? (
          <img src={shown} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="flex flex-col items-center gap-1 text-sm text-gray-500">
            <ImagePlus className="h-6 w-6" />
            Choose an image
          </span>
        )}
        {shown && (
          <span className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">Change</span>
        )}
      </label>
      <input id={id} type="file" accept=".png,.jpg,.jpeg" onChange={handleChange} className="sr-only" />
      <p className="mt-1.5 text-xs text-gray-500">PNG or JPG, up to 1MB.</p>
    </div>
  );
}

export default ImageInput;
