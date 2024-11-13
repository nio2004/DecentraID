import "@/styles/globals.css";
import {
  Navbar,
  Footer,
  Stats,
  Billing,
  Business,
  CardDeal,
  Clients,
  CTA,
  Testimonials,
} from "@components";
import { robot } from "@public/assets";
import styles from "@styles/style";
import Image from "next/image";
export const metadata = {
  title: "HooBank",
  description:
    "Hoobank is an Modern Landing Page built with Next JS and Typescript",
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <div className="bg-primary w-full overflow-hidden">
          <div className="bg-primary w-full overflow-hidden">
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
              <div className={`${styles.boxWidth} `}>
                <Navbar />
              </div>
            </div>
            <div className={`flex bg-primary ${styles.flexStart}`}>
              {children}

              <div
                className={`${styles.flexCenter} flex-1 flex md:my-0 my-10 relative right-[-250px] max-w-[40vw]`}
              >
                <Image
                  src={robot}
                  alt="billings"
                  className="w-[100%] h-[100%] relative z-[5]"
                />
                <div className="absolute z-[0] w-[40%] h-[35%] top-0 pink__gradient" />
                <div className="absolute z-[1] w-[80%] h-[80%] rounded-full bottom-40 white__gradient" />
                <div className="absolute z-[0] w-[50%] h-[50%] right-20 bottom-20 blue__gradient" />
              </div>
            </div>
            <div
              className={`bg-primary ${styles.paddingX} ${styles.flexStart}`}
            >
              <div className={`${styles.boxWidth}`}>
                {/* <Stats />
                <Business />
                <Billing />
                <CardDeal />
                <Testimonials />
                <Clients />
                <CTA /> */}
                <Footer />
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
