import { Button, Result } from "antd";
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function NotFound() {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="max-w-content mx-auto px-6 py-24 flex items-center justify-center">
      <Result
        status="404"
        title="Page Not Found"
        subTitle="The page you're looking for doesn't exist or has been moved."
        extra={
          <Link to="/">
            <Button type="primary">Back to Home</Button>
          </Link>
        }
      />
    </div>
  );
}
