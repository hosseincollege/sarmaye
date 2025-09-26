import { useState, useEffect } from "react";
import axios from "axios";

export default function EnvInfoButton() {
  const [showInfo, setShowInfo] = useState(false);
  const [backendInfo, setBackendInfo] = useState(null);

  useEffect(() => {
    axios
      .get(`${process.env.REACT_APP_API_URL}/api/backend-info/`)
      .then(res => setBackendInfo(res.data))
      .catch(() => setBackendInfo(null));
  }, []);

  return (
    <div
      style={{ position: "fixed", top: 10, left: 100, zIndex: 9999 }}
      onMouseEnter={() => setShowInfo(true)}
      onMouseLeave={() => setShowInfo(false)}
    >
      {/* آیکون ℹ️ */}
      <div
        style={{
          background: "#ffffffff",
          color: "white",
          padding: "0px 0px",
          borderRadius: "30%",
          cursor: "pointer",
        }}
      >
        ℹ️
      </div>

      {/* پنجره اطلاعات */}
      {showInfo && (
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 0,
            background: "white",
            padding: "10px",
            border: "1px solid #ccc",
            borderRadius: "8px",
          }}
        >
          <p>
            <b>Frontend:</b>{" "}
            {process.env.NODE_ENV?.toUpperCase() || "unknown"}
          </p>
          <p>
            <b>Backend:</b> {backendInfo?.backend_env || "unknown"}
          </p>

          {backendInfo?.is_superuser && (
            <>
              <p>
                <b>API URL:</b>{" "}
                {process.env.REACT_APP_API_URL || "unknown"}
              </p>
              <p>
                <b>Your IP:</b> {backendInfo?.ip || "unknown"}
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
