import React from 'react';
import { ErrorResponse, isRouteErrorResponse, useRouteError } from 'react-router';
import { TriangleAlert } from 'lucide-react';

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
      <div className="flex flex-row items-center gap-2">
        <div className="rounded-lg bg-container p-2">
          <TriangleAlert size={48} className="text-red-400" />
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
