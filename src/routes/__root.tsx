import { createRootRoute } from '@tanstack/react-router';
import RootComponent from '@/components/RootComponents'
import NotFound from '../components/NotFound';

export const Route = createRootRoute( {
  component         : RootComponent,
  notFoundComponent : NotFound
} )