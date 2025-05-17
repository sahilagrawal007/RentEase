import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import { toast } from 'react-toastify';

function ErrorBoundary() {
  const error = useRouteError();
  
  // Log the error for debugging
  console.error('Error:', error);

  // Show error toast
  React.useEffect(() => {
    toast.error(error.message || 'Something went wrong!');
  }, [error]);

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>Oops! Something went wrong</h1>
        <p>{error.message || 'An unexpected error occurred'}</p>
        <div className="error-actions">
          <button onClick={() => window.location.reload()}>
            Refresh Page
          </button>
          <Link to="/" className="home-link">
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ErrorBoundary; 