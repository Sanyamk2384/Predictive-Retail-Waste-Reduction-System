import { useAuth } from "../context/AuthContext.jsx";
import Card from "../components/Card.jsx";
import Button from "../components/Button.jsx";
import { formatDate } from "../utils/format.js";

export default function Settings() {
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl text-ink">Settings</h1>
        <p className="mt-1 text-sm text-muted">Your account details.</p>
      </div>

      <Card className="max-w-md">
        <dl className="flex flex-col gap-4 text-sm">
          <div>
            <dt className="text-muted">Name</dt>
            <dd className="mt-0.5 font-medium text-ink">{user?.name}</dd>
          </div>
          <div>
            <dt className="text-muted">Email</dt>
            <dd className="mt-0.5 font-medium text-ink">{user?.email}</dd>
          </div>
          <div>
            <dt className="text-muted">Role</dt>
            <dd className="mt-0.5 font-medium capitalize text-ink">{user?.role}</dd>
          </div>
          <div>
            <dt className="text-muted">Member since</dt>
            <dd className="mt-0.5 font-medium text-ink">{formatDate(user?.createdAt)}</dd>
          </div>
        </dl>

        <Button variant="secondary" className="mt-6 w-full" onClick={logout}>
          Log out
        </Button>
      </Card>
    </div>
  );
}
