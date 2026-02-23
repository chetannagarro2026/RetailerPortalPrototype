import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login() {
	const { isLoading, isAuthenticated, user, signOut } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (!isLoading && isAuthenticated) {
			navigate("/");
		}
	}, [isLoading, isAuthenticated, navigate]);

	return (
		<div className="min-h-[60vh] flex items-center justify-center px-4">
			<div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow p-6">
				<h2 className="text-2xl font-semibold mb-4">Sign in</h2>

				{isLoading && <p className="mb-4">Loading...</p>}

				{!isLoading && !isAuthenticated && (
					<div>
						<p className="mb-4">Please sign in to continue.</p>
						<button
							onClick={() => navigate('/sign-in')}
							className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
						>
							Go to Sign In
						</button>
					</div>
				)}

				{!isLoading && isAuthenticated && (
					<div>
						<p className="mb-2">Signed in as <strong>{user?.username || user?.name || 'User'}</strong></p>
						<div className="flex gap-2">
							<button onClick={() => navigate('/')} className="px-4 py-2 border rounded">Go to Home</button>
							<button onClick={() => signOut()} className="px-4 py-2 bg-red-600 text-white rounded">Sign out</button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
