import { HeadContent, Outlet, createRootRouteWithContext } from "@tanstack/react-router";

import "../index.css";

export interface RouterAppContext {}

export const Route = createRootRouteWithContext<RouterAppContext>()({
  component: RootComponent,
  head: () => ({
    meta: [
      {
        title: "slither-charts — charts that hiss",
      },
      {
        name: "description",
        content:
          "Meme charts for React — a composable chart library where every mark is a live snake. Line snakes, bar cobras, an ouroboros pie, worm sparklines.",
      },
    ],
  }),
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Outlet />
    </>
  );
}
