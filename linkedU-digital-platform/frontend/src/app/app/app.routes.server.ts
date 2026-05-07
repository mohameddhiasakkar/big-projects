import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'destinations/pays/:country',
    renderMode: RenderMode.Server, // Renders each request on the server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];