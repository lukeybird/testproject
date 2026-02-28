export const metadata = {
  title: 'Float State',
  description: 'Minimal float state app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, backgroundColor: 'white' }}>{children}</body>
    </html>
  )
}
