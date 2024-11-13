"use client"
import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { LatLngExpression } from "leaflet";
// import * as a from 'leaf';
import ScrollUp from "@/components/Common/ScrollUp";
import About from "@/components/About";
import HomeBlogSection from "@/components/Blog/HomeBlogSection";
import CallToAction from "@/components/CallToAction";
import Clients from "@/components/Clients";
import Contact from "@/components/Contact";
import Faq from "@/components/Faq";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Pricing from "@/components/Pricing";
import Team from "@/components/Team";
import Testimonials from "@/components/Testimonials";

// You may replace this with your custom address state
const initialAddress = "123 Main St, Your City, Your Country";

export default function Home() {
  const [user, setUser] = useState("No user Found");
  const [address, setAddress] = useState(initialAddress);

  // Example coordinates (Replace with actual location if needed)
  const position: LatLngExpression = [51.505, -0.09]; // Coordinates for the map

  return (
    <main className="h-fit">
      <ScrollUp />
      <section
        id="home"
        className="relative h-fit  overflow-hidden bg-primary pt-[120px] md:pt-[130px] lg:pt-[160px]"
      >
        <div
          className="hero-content wow fadeInUp mx-auto max-w-[780px] text-center"
          data-wow-delay=".2s"
        >
          <h1 className="mb-6 text-3xl font-bold leading-snug text-white sm:text-4xl sm:leading-snug lg:text-5xl lg:leading-[1.2]">
            {user}
          </h1>
        </div>

       {/* Map Section */}
       <section id="map" className="py-10 min-w-[40vw] w-fit h-fit min-h-[40vh] mx-auto m-2 overflow-hidden">
        <div className="mx-auto max-w-5xl text-center overflow-hidden">
          <h2 className="text-2xl font-bold mb-6">Our Location</h2>
          <div className="mb-4">
            <p>{address}</p>
          </div>
          <div className="overflow-hidden">

          <MapContainer
            center={position} // Center prop to set the initial coordinates
            zoom={13} // Zoom prop to set the initial zoom level
            style={{ height: "100%", width: "100%" }} // Full width and height
            className="overflow-hidden border border-gray-500"
         >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <Marker position={position}>
              <Popup>We are here!</Popup>
            </Marker>
          </MapContainer>
          </div>
        </div>
      </section>
              </section>

      {/* Commented out components */}
      {/* <Hero />
      <Features />
      <About />
      <CallToAction />
      <Pricing />
      <Testimonials />
      <Faq />
      <Team />
      <HomeBlogSection />
      <Contact />
      <Clients /> */}
    </main>
  );
}
