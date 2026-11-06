import StaffingServices from "./home/Staffing/StaffingServices";
import EventCategories from "./home/Event-Categories/EventCategories";
import HowItWorks from "./home/How-It-Works/HowItWorks";
import WhyChooseUs from "./home/WhyChooseUs/WhyChooseUs";
import CitiesWeServe from "./home/CitiesWeServe/CitiesWeServe";
import ClientCTA from "./home/ClientCTA/ClientCTA";
import StaffCTA from "./home/StaffCTA/StaffCTA";
import FAQ from "./home/FAQ/FAQ";
import ContactSupport from "./home/ContactSupport/ContactSupport";
import HomeMain from "./home/HomeMain";

export default function Home() {
  return (
    <main id="main">
      <HomeMain/>
      <StaffingServices />
      <EventCategories />
      <HowItWorks />
      <WhyChooseUs />
      <CitiesWeServe />
      <ClientCTA />
      <StaffCTA />
      <FAQ />
      <ContactSupport />
    </main>
  );
}