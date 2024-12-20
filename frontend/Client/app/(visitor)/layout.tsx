import "@/styles/globals.css";
import styles from "@styles/style";
import { Navbar } from "@components";
export const metadata = {
  title: 'Next.js',
  description: 'Generated by Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <div className="w-full min-h-screen bg-primary overflow-hidden">
          <div className={`${styles.paddingX} ${styles.flexCenter}`}>
            <Navbar />
          </div>
          <div className={`${styles.paddingX} ${styles.flexCenter}`}>
            {children}
          </div>
          <div className="min-h-[70vh] flex flex-1 relative right-[-250px] top-1/2 max-w-[40vw] " >
                <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
                <div className="absolute z-[1] w-[80%] h-[80%] rounded-full bottom-40 white__gradient" />
                <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
          </div>
        </div>  
      </body>
    </html>
  )
}
