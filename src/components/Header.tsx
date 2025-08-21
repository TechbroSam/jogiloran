// src/components/Header.tsx
import { client } from "@/lib/sanity";
import Navbar from "./Navbar"; // We will import our interactive navbar here

interface Category {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
}

const getCategories = async () => {
  const query = `*[_type == "category"] { _id, name, slug }`;
  const data = await client.fetch(query);
  return data;
};

export default async function Header() {
  const categories: Category[] = await getCategories();

  // We render the Navbar (Client Component) and pass the categories down as a prop
  return <Navbar categories={categories} />;
}