import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/features/home/HomePage'
import { MeaningsPage } from '@/features/meanings/MeaningsPage'
import { SharedSpreadPage } from '@/features/meanings/SharedSpreadPage'
import { ActiveSpreadProvider } from '@/features/spread/ActiveSpreadProvider'

const basename = import.meta.env.BASE_URL

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: (
        <ActiveSpreadProvider>
          <AppShell />
        </ActiveSpreadProvider>
      ),
      children: [
        { index: true, element: <HomePage /> },
        { path: 'meanings', element: <MeaningsPage /> },
        { path: 'shared/:encoded', element: <SharedSpreadPage /> },
      ],
    },
  ],
  { basename },
)

export function AppRouter() {
  return <RouterProvider router={router} />
}
