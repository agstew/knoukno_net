import Title from "@/components/Title";
import Head from "@/components/Head";
import Body from "@/components/Body";
import Hero from "@/components/Hero";
import Section from "@/components/Section";
import PriceCard from "@/components/PriceCard";
import HomeCard from "@/components/HomeCard";
import List from "@/components/List";

export default function HomePage() {
  return (
    <>
      <Title text="KnoUKno.net" />
      <Head />
      <Hero />
      <Body>
        <HomeCard />
      </Body>
      <Section />
      <PriceCard />
      <List />
    </>
  );
}
