import { ThemeProvider } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import { getThemeServerFn } from '@/lib/theme';
import { TinyBaseProvider, tablesSchema, useCreateQueries, useCreateStore, valuesSchema } from '@/lib/tinybase';
import { IconAlertTriangle } from '@tabler/icons-react';
import { HeadContent, Link, Scripts, createRootRoute } from '@tanstack/react-router';
import { Inspector } from 'tinybase/ui-react-inspector';
import { createQueries, createStore } from 'tinybase/with-schemas';
import appCss from '../styles.css?url';

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Ajsr report generator',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),
  loader: () => getThemeServerFn(),
  notFoundComponent() {
    return (
      <div className="flex min-h-dvh w-full flex-col items-center justify-center gap-3 p-5">
        <div className="flex items-center gap-3 rounded-lg border border-destructive bg-background p-5 text-red-500">
          <IconAlertTriangle className="size-6" />
          <p className="leading-none">Page Not found 404</p>
        </div>
        <Link to="/">
          <Button variant={'outline'}>go home</Button>
        </Link>
      </div>
    );
  },
  shellComponent: RootDocument,
})


function RootDocument({ children }: { children: React.ReactNode }) {
  const theme = Route.useLoaderData();
  const store = useCreateStore(() =>
    createStore().setSchema(tablesSchema, valuesSchema)
  );
  const queries = useCreateQueries(store, createQueries, []);
  return (
    <html className={theme} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider theme={theme}>
          <TinyBaseProvider store={store} queries={queries}>
              {children}
              <Inspector />
          </TinyBaseProvider>
          {/* <TanStackDevtools
            config={{
              position: 'bottom-right',
            }}
            plugins={[
              {
                name: 'Tanstack Router',
                render: <TanStackRouterDevtoolsPanel />,
              },
            ]}
          /> */}
          <Scripts />
        </ThemeProvider>
      </body>
    </html>
  )
}
