import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Legacy route — redirects to the demand-first intake flow.
 * Kept so old bookmarks and links don't 404.
 */
export default function GetStarted() {
  const navigate = useNavigate();
  useEffect(() => {
    navigate("/demand-intake", { replace: true });
  }, [navigate]);
  return null;
}
