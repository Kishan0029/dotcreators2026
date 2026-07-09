import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { useState } from "react";
import { OBYSLoader } from "../components/OBYSLoader";
import appCss from "../styles.css?url";

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Creator Summit 2026 — Dot Entertainments" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Added preconnects and font stylesheet
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: ({ children }) => (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  ),
  component: () => {
    const { queryClient } = Route.useRouteContext();
    const [isLoaded, setIsLoaded] = useState(false);
    return (
      <QueryClientProvider client={queryClient}>
        {!isLoaded && <OBYSLoader onComplete={() => setIsLoaded(true)} />}
        <div style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.8s ease" }}>
          <Outlet />
        </div>
      </QueryClientProvider>
    );
  },
});
