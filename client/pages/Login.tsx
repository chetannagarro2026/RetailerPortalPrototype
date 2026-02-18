import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
	const { initialized, authenticated, login, logout } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (initialized && authenticated) {
			navigate("/");
		}
	}, [initialized, authenticated, navigate]);

	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4">
			<div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow p-6">
				<h2 className="text-2xl font-semibold mb-4">Sign in</h2>

				{!initialized && <p className="mb-4">Initializing authentication...</p>}

				{initialized && !authenticated && (
					<div>
						<p className="mb-4">Sign in using Keycloak to continue.</p>
						<button
							onClick={() => login()}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
						>
							Sign in with Keycloak
						</button>
					</div>
				)}

				{initialized && authenticated && (
					<div>
						<p className="mb-2">Signed in as <strong>User</strong></p>
						<div className="flex gap-2">
							<button onClick={() => navigate('/')} className="px-4 py-2 border rounded">Go to Home</button>
							<button onClick={() => logout()} className="px-4 py-2 bg-red-600 text-white rounded">Sign out</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
