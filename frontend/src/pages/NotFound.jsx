import { Link } from "react-router-dom";
import { Compass } from "lucide-react";
import { EmptyState } from "../components/Status";

function NotFound() {
  return (
    <div className="container-page py-16">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="The page you're looking for doesn't exist or has moved."
        action={<Link to="/" className="btn-primary">Back to home</Link>}
      />
    </div>
  );
}

export default NotFound;
