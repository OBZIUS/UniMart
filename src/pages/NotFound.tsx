
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to error page instead of showing generic 404
    navigate('/error');
  }, [navigate]);

  return null;
};

export default NotFound;
