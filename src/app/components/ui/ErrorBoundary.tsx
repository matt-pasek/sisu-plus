import React from 'react';
import { ErrorResponse, isRouteErrorResponse, useRouteError } from 'react-router';

const RouteErrorContent: React.FC<{ error: ErrorResponse }> = ({ error }) => {
  return (
    <>
      <div className="flex flex-row items-center gap-2">
        <h1 className="text-red-400">ERR</h1>
        <p>
          {error.status} {error.statusText}
        </p>
      </div>
      <pre>{error.data}</pre>
    </>
  );
};

const ErrorContent: React.FC<{ error: Error }> = ({ error }) => (
  <>
    <div className="flex flex-row items-center gap-2">
      <h1 className="text-red-400">ERR</h1>
      <p>{error.message}</p>
    </div>
    <pre>{error.stack}</pre>
  </>
);

export const RootErrorBoundary: React.FC = () => {
  let error = useRouteError();

  return (
    <div className="flex w-3/4 flex-col gap-2 p-5 text-offwhite">
      <div className="flex flex-row items-center gap-2 text-red-400">
        <div className="rounded-lg bg-container p-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            className="size-12"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
            />
          </svg>
        </div>
        <div>
          <h1 className="text-2xl font-medium">An error has occurred</h1>
          <p className="text-xl opacity-70">Whoops, this shouldn't have happened.</p>
        </div>
      </div>
      <p className="text-lg">
        Try refreshing the page. If the error continues, click the icon in bottom right corner and send me a screenshot
        of the error message.
      </p>
      <div className="rounded-lg bg-container px-4 py-2 font-mono">
        {isRouteErrorResponse(error) ? (
          <RouteErrorContent error={error} />
        ) : error instanceof Error ? (
          <ErrorContent error={error} />
        ) : (
          <h1>Unknown Error</h1>
        )}
      </div>
    </div>
  );
};
