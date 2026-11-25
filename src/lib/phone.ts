import { useEffect, useState } from "react";

/** Below Tailwind's `md` breakpoint: a phone. Scenes switch to their phone layout here; desktop never sees it. */
const QUERY = "(max-width: 767px)";

export function usePhone() {
  const [phone, setPhone] = useState(() => typeof window !== "undefined" && window.matchMedia(QUERY).matches);
  useEffect(() => {
    const media = window.matchMedia(QUERY);
    const update = () => setPhone(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return phone;
}
