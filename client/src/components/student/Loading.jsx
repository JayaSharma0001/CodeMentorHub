import { useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const Loading = () => {
  const { path } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const { backendUrl, fetchUserEnrolledCourses } = useContext(AppContext);

  useEffect(() => {
    const finalizePurchase = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const sessionId = params.get("session_id");
        const token = await getToken();

        if (token) {
          await axios.post(
            `${backendUrl}/api/user/confirm-purchase`,
            { sessionId },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          await fetchUserEnrolledCourses();
        }
      } catch (error) {
        console.error(error);
      } finally {
        if (path) {
          navigate(`/${path}`);
        }
      }
    };

    finalizePurchase();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-16 sm:w-20 aspect-square border-4 border-gray-300 border-t-4 border-t-blue-400 rounded-full animate-spin"></div>
    </div>
  );
};

export default Loading;
